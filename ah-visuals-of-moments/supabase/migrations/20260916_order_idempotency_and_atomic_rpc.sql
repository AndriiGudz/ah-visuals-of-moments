-- ==============================================================================
-- AH Visuals of Moments: Migration 20260916_order_idempotency_and_atomic_rpc
-- 1. Add persistent idempotency_key to orders table
-- 2. Upgrade rpc_create_order_with_reservation to enforce:
--    - Persistent DB-backed idempotency check
--    - Product and Variant active validations
--    - Authoritative price from products.price (anti-tamper)
--    - Row-level lock FOR UPDATE and strict anti-overselling
--    - Atomic RESERVE movement creation
-- ==============================================================================

-- 1. Add idempotency_key to orders table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'idempotency_key'
    ) THEN
        ALTER TABLE orders ADD COLUMN idempotency_key TEXT;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key 
ON orders (idempotency_key) 
WHERE idempotency_key IS NOT NULL;

-- 2. Recreate rpc_create_order_with_reservation with full authoritative logic
CREATE OR REPLACE FUNCTION rpc_create_order_with_reservation(
    p_order_number TEXT,
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_shipping_address TEXT,
    p_total_amount NUMERIC,
    p_notes TEXT,
    p_items JSONB, -- Array of { variant_id: UUID, quantity: INTEGER, unit_price?: NUMERIC }
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_existing_order RECORD;
    v_item RECORD;
    v_inv RECORD;
    v_qty INTEGER;
    v_calculated_total NUMERIC := 0;
    v_variant_id UUID;
    v_variant_info RECORD;
    v_item_unit_price NUMERIC;
BEGIN
    -- 0. Check persistent idempotency key (cross-instance duplicate protection)
    IF p_idempotency_key IS NOT NULL AND TRIM(p_idempotency_key) <> '' THEN
        SELECT id, order_number, total_amount INTO v_existing_order
        FROM orders
        WHERE idempotency_key = TRIM(p_idempotency_key);

        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true,
                'order_id', v_existing_order.id,
                'order_number', v_existing_order.order_number,
                'total_amount', v_existing_order.total_amount,
                'idempotent', true
            );
        END IF;
    END IF;

    -- 1. Pre-validation and row locking for all variants in request
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(variant_id UUID, quantity INTEGER, unit_price NUMERIC)
    LOOP
        v_variant_id := v_item.variant_id;
        v_qty := v_item.quantity;

        IF v_qty <= 0 THEN
            RAISE EXCEPTION 'Некорректное количество для позиции: %', v_qty;
        END IF;

        -- Validate Variant and Product active status and fetch authoritative price from DB
        SELECT 
            pv.id AS variant_id,
            pv.active AS variant_active,
            pv.sku,
            p.id AS product_id,
            p.name AS product_name,
            p.active AS product_active,
            p.price AS authoritative_price
        INTO v_variant_info
        FROM product_variants pv
        JOIN products p ON p.id = pv.product_id
        WHERE pv.id = v_variant_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Вариант товара % не найден', v_variant_id;
        END IF;

        IF NOT v_variant_info.product_active THEN
            RAISE EXCEPTION 'Товар "%" не доступен для заказа (деактивирован)', v_variant_info.product_name;
        END IF;

        IF NOT v_variant_info.variant_active THEN
            RAISE EXCEPTION 'Вариант товара % (SKU: %) не доступен для заказа (деактивирован)', 
                v_variant_info.product_name, v_variant_info.sku;
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
            RAISE EXCEPTION 'Недостаточно доступного остатка для товара % (SKU: %). Доступно: %, Запрошено: %',
                v_variant_info.product_name, v_variant_info.sku, (v_inv.on_hand - v_inv.reserved), v_qty;
        END IF;

        -- Authoritative price calculation: unit price is strictly products.price from DB
        v_calculated_total := v_calculated_total + (v_qty * v_variant_info.authoritative_price);
    END LOOP;

    -- 2. Create the Order with authoritative total amount and persistent idempotency_key
    INSERT INTO orders (
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        total_amount,
        status,
        notes,
        idempotency_key
    ) VALUES (
        p_order_number,
        p_customer_name,
        p_customer_email,
        p_customer_phone,
        p_shipping_address,
        v_calculated_total,
        'NEW',
        p_notes,
        NULLIF(TRIM(p_idempotency_key), '')
    ) RETURNING id INTO v_order_id;

    -- 3. Reserve stock and insert order items + stock movements
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(variant_id UUID, quantity INTEGER, unit_price NUMERIC)
    LOOP
        v_variant_id := v_item.variant_id;
        v_qty := v_item.quantity;

        SELECT 
            p.price AS authoritative_price
        INTO v_item_unit_price
        FROM product_variants pv
        JOIN products p ON p.id = pv.product_id
        WHERE pv.id = v_variant_id;

        -- Fetch current locked inventory state
        SELECT * INTO v_inv FROM inventory WHERE variant_id = v_variant_id FOR UPDATE;

        -- Insert order item with authoritative unit and total price
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
            v_item_unit_price,
            v_qty * v_item_unit_price,
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
        'order_number', p_order_number,
        'total_amount', v_calculated_total,
        'idempotent', false
    );
END;
$$;
