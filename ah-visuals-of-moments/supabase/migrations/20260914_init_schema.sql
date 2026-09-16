-- ==============================================================================
-- AH Visuals of Moments: Database Schema & Atomic RPC
-- Supabase / PostgreSQL (Source of Truth)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Product Variants (Color, Size, SKU)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    color TEXT NOT NULL,
    size TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_product_variant UNIQUE (product_id, color, size)
);

-- 3. Inventory (on_hand, reserved, available computed column)
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID UNIQUE NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    on_hand INTEGER NOT NULL DEFAULT 0,
    reserved INTEGER NOT NULL DEFAULT 0,
    available INTEGER GENERATED ALWAYS AS (on_hand - reserved) STORED,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_on_hand_non_negative CHECK (on_hand >= 0),
    CONSTRAINT chk_reserved_non_negative CHECK (reserved >= 0),
    CONSTRAINT chk_reserved_lte_on_hand CHECK (reserved <= on_hand)
);

-- 4. Stock Movements (Full Audit Log)
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'INITIAL_STOCK',
        'RESTOCK',
        'RESERVE',
        'RELEASE_RESERVATION',
        'SHIP',
        'MANUAL_ADJUSTMENT',
        'RETURN'
    )),
    quantity INTEGER NOT NULL,
    order_id TEXT,
    on_hand_before INTEGER,
    on_hand_after INTEGER,
    reserved_before INTEGER,
    reserved_after INTEGER,
    created_by TEXT,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN (
        'NEW',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'COMPLETED',
        'CANCELLED'
    )),
    shipped_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    reserved BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Google Integrations Settings
CREATE TABLE IF NOT EXISTS google_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'SERVICE_ACCOUNT' CHECK (type IN ('SERVICE_ACCOUNT', 'OAUTH')),
    sheet_id TEXT,
    sheet_title TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Google Import / Export Logs
CREATE TABLE IF NOT EXISTS google_import_export_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type TEXT NOT NULL CHECK (operation_type IN ('IMPORT', 'EXPORT')),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('PRODUCTS', 'INVENTORY', 'ORDERS', 'STOCK_MOVEMENTS', 'MONTHLY_REPORT')),
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'ERROR', 'PARTIAL')),
    source_destination TEXT NOT NULL,
    items_processed INTEGER NOT NULL DEFAULT 0,
    items_created INTEGER NOT NULL DEFAULT 0,
    items_updated INTEGER NOT NULL DEFAULT 0,
    items_failed INTEGER NOT NULL DEFAULT 0,
    details JSONB,
    performed_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_variant_id ON inventory(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_variant_id ON stock_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_google_logs_created_at ON google_import_export_logs(created_at DESC);

-- ==============================================================================
-- Atomic RPC Functions (Concurrency & Anti-Overselling Protection)
-- ==============================================================================

-- 1. Create Order with Immediate Reservation
CREATE OR REPLACE FUNCTION rpc_create_order_with_reservation(
    p_order_number TEXT,
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_shipping_address TEXT,
    p_total_amount NUMERIC,
    p_notes TEXT,
    p_items JSONB -- Array of { variant_id, quantity, unit_price }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_item RECORD;
    v_inv RECORD;
    v_qty INTEGER;
    v_unit_price NUMERIC;
    v_total_price NUMERIC;
    v_variant_id UUID;
    v_variant RECORD;
BEGIN
    -- 1. Pre-validation and row locking for all variants in request
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(variant_id UUID, quantity INTEGER, unit_price NUMERIC)
    LOOP
        v_variant_id := v_item.variant_id;
        v_qty := v_item.quantity;

        IF v_qty <= 0 THEN
            RAISE EXCEPTION 'Некорректное количество для варианта %: %', v_variant_id, v_qty;
        END IF;

        -- Lock inventory row FOR UPDATE
        SELECT * INTO v_inv
        FROM inventory
        WHERE variant_id = v_variant_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Запись остатков для варианта % не найдена', v_variant_id;
        END IF;

        -- Strict overselling check
        IF (v_inv.on_hand - v_inv.reserved) < v_qty THEN
            SELECT name, sku INTO v_variant
            FROM product_variants pv
            JOIN products p ON p.id = pv.product_id
            WHERE pv.id = v_variant_id;

            RAISE EXCEPTION 'Недостаточно доступного остатка для товара % (SKU: %). Доступно: %, Запрошено: %',
                v_variant.name, v_variant.sku, (v_inv.on_hand - v_inv.reserved), v_qty;
        END IF;
    END LOOP;

    -- 2. Create the Order
    INSERT INTO orders (
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        total_amount,
        status,
        notes
    ) VALUES (
        p_order_number,
        p_customer_name,
        p_customer_email,
        p_customer_phone,
        p_shipping_address,
        p_total_amount,
        'NEW',
        p_notes
    ) RETURNING id INTO v_order_id;

    -- 3. Reserve stock and insert order items + stock movements
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(variant_id UUID, quantity INTEGER, unit_price NUMERIC)
    LOOP
        v_variant_id := v_item.variant_id;
        v_qty := v_item.quantity;
        v_unit_price := v_item.unit_price;
        v_total_price := v_qty * v_unit_price;

        -- Fetch current locked inventory state
        SELECT * INTO v_inv FROM inventory WHERE variant_id = v_variant_id FOR UPDATE;

        -- Insert order item
        INSERT INTO order_items (
            order_id,
            variant_id,
            quantity,
            unit_price,
            total_price,
            reserved
        ) VALUES (
            v_order_id,
            v_variant_id,
            v_qty,
            v_unit_price,
            v_total_price,
            true
        );

        -- Update inventory (increase reserved)
        UPDATE inventory
        SET reserved = reserved + v_qty,
            updated_at = now()
        WHERE variant_id = v_variant_id;

        -- Insert stock movement: RESERVE
        INSERT INTO stock_movements (
            variant_id,
            type,
            quantity,
            order_id,
            on_hand_before,
            on_hand_after,
            reserved_before,
            reserved_after,
            created_by,
            note
        ) VALUES (
            v_variant_id,
            'RESERVE',
            v_qty,
            p_order_number,
            v_inv.on_hand,
            v_inv.on_hand,
            v_inv.reserved,
            v_inv.reserved + v_qty,
            'SYSTEM',
            'Резервирование под заказ ' || p_order_number
        );
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', p_order_number
    );
END;
$$;

-- 2. Update Order Status with Atomic Stock Transitions
CREATE OR REPLACE FUNCTION rpc_update_order_status(
    p_order_id UUID,
    p_target_status TEXT,
    p_note TEXT DEFAULT NULL,
    p_user TEXT DEFAULT 'Admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_inv RECORD;
BEGIN
    -- 1. Lock order row
    SELECT * INTO v_order
    FROM orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Заказ с ID % не найден', p_order_id;
    END IF;

    -- If target is same as current, return immediately
    IF v_order.status = p_target_status THEN
        RETURN jsonb_build_object('success', true, 'status', v_order.status, 'message', 'Статус не изменился');
    END IF;

    -- Validate transitions
    IF v_order.status = 'CANCELLED' THEN
        RAISE EXCEPTION 'Нельзя изменить статус отменённого заказа %', v_order.order_number;
    END IF;

    IF v_order.status = 'COMPLETED' AND p_target_status != 'COMPLETED' THEN
        RAISE EXCEPTION 'Заказ % уже завершён', v_order.order_number;
    END IF;

    IF v_order.status = 'SHIPPED' AND p_target_status = 'CANCELLED' THEN
        RAISE EXCEPTION 'Нельзя отменить уже отправленный заказ %. Используйте процедуру возврата (RETURN)', v_order.order_number;
    END IF;

    -- Stock action: SHIPPED
    IF p_target_status = 'SHIPPED' AND v_order.status != 'SHIPPED' THEN
        FOR v_item IN SELECT * FROM order_items WHERE order_id = p_order_id
        LOOP
            SELECT * INTO v_inv FROM inventory WHERE variant_id = v_item.variant_id FOR UPDATE;

            -- Deduct from physical on_hand and decrease reserved
            UPDATE inventory
            SET on_hand = on_hand - v_item.quantity,
                reserved = reserved - v_item.quantity,
                updated_at = now()
            WHERE variant_id = v_item.variant_id;

            -- Update order item flag
            UPDATE order_items
            SET reserved = false
            WHERE id = v_item.id;

            -- Insert movement: SHIP
            INSERT INTO stock_movements (
                variant_id,
                type,
                quantity,
                order_id,
                on_hand_before,
                on_hand_after,
                reserved_before,
                reserved_after,
                created_by,
                note
            ) VALUES (
                v_item.variant_id,
                'SHIP',
                v_item.quantity,
                v_order.order_number,
                v_inv.on_hand,
                v_inv.on_hand - v_item.quantity,
                v_inv.reserved,
                v_inv.reserved - v_item.quantity,
                p_user,
                COALESCE(p_note, 'Отправка заказа ' || v_order.order_number)
            );
        END LOOP;

        UPDATE orders
        SET status = 'SHIPPED',
            shipped_at = now(),
            updated_at = now()
        WHERE id = p_order_id;

    -- Stock action: CANCELLED
    ELSIF p_target_status = 'CANCELLED' THEN
        FOR v_item IN SELECT * FROM order_items WHERE order_id = p_order_id
        LOOP
            IF v_item.reserved THEN
                SELECT * INTO v_inv FROM inventory WHERE variant_id = v_item.variant_id FOR UPDATE;

                -- Release reservation: on_hand unchanged, reserved decreased
                UPDATE inventory
                SET reserved = reserved - v_item.quantity,
                    updated_at = now()
                WHERE variant_id = v_item.variant_id;

                UPDATE order_items
                SET reserved = false
                WHERE id = v_item.id;

                -- Insert movement: RELEASE_RESERVATION
                INSERT INTO stock_movements (
                    variant_id,
                    type,
                    quantity,
                    order_id,
                    on_hand_before,
                    on_hand_after,
                    reserved_before,
                    reserved_after,
                    created_by,
                    note
                ) VALUES (
                    v_item.variant_id,
                    'RELEASE_RESERVATION',
                    v_item.quantity,
                    v_order.order_number,
                    v_inv.on_hand,
                    v_inv.on_hand,
                    v_inv.reserved,
                    v_inv.reserved - v_item.quantity,
                    p_user,
                    COALESCE(p_note, 'Отмена заказа ' || v_order.order_number || ', возврат резерва')
                );
            END IF;
        END LOOP;

        UPDATE orders
        SET status = 'CANCELLED',
            updated_at = now()
        WHERE id = p_order_id;

    -- Generic status updates without stock mutation (CONFIRMED, PROCESSING, COMPLETED)
    ELSE
        UPDATE orders
        SET status = p_target_status,
            updated_at = now()
        WHERE id = p_order_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'status', p_target_status
    );
END;
$$;

-- 3. Manual Inventory Adjustment (RESTOCK or MANUAL_ADJUSTMENT)
CREATE OR REPLACE FUNCTION rpc_adjust_inventory(
    p_variant_id UUID,
    p_type TEXT,
    p_delta INTEGER,
    p_note TEXT,
    p_user TEXT DEFAULT 'Admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_inv RECORD;
    v_new_on_hand INTEGER;
BEGIN
    IF p_type NOT IN ('RESTOCK', 'MANUAL_ADJUSTMENT', 'INITIAL_STOCK') THEN
        RAISE EXCEPTION 'Недопустимый тип корректировки: %', p_type;
    END IF;

    -- Lock inventory row
    SELECT * INTO v_inv
    FROM inventory
    WHERE variant_id = p_variant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Запись остатков для варианта % не найдена', p_variant_id;
    END IF;

    v_new_on_hand := v_inv.on_hand + p_delta;

    IF v_new_on_hand < 0 THEN
        RAISE EXCEPTION 'Физический остаток не может быть отрицательным (расчётное: %)', v_new_on_hand;
    END IF;

    IF v_new_on_hand < v_inv.reserved THEN
        RAISE EXCEPTION 'Физический остаток (%) не может быть меньше активного резерва (%)', v_new_on_hand, v_inv.reserved;
    END IF;

    UPDATE inventory
    SET on_hand = v_new_on_hand,
        updated_at = now()
    WHERE variant_id = p_variant_id;

    INSERT INTO stock_movements (
        variant_id,
        type,
        quantity,
        on_hand_before,
        on_hand_after,
        reserved_before,
        reserved_after,
        created_by,
        note
    ) VALUES (
        p_variant_id,
        p_type,
        p_delta,
        v_inv.on_hand,
        v_new_on_hand,
        v_inv.reserved,
        v_inv.reserved,
        p_user,
        p_note
    );

    RETURN jsonb_build_object(
        'success', true,
        'variant_id', p_variant_id,
        'on_hand', v_new_on_hand,
        'reserved', v_inv.reserved,
        'available', (v_new_on_hand - v_inv.reserved)
    );
END;
$$;
