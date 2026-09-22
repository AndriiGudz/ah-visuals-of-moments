-- ==============================================================================
-- AH Visuals of Moments: Seed Data
-- 2 Initial Products with Variants and Inventory
-- ==============================================================================

DO $$
DECLARE
    v_prod1_id UUID;
    v_prod2_id UUID;
    v_var_id UUID;
BEGIN
    -- Product 1: Moment #01 - Sunset Kyiv
    INSERT INTO products (name, slug, description, price, active)
    VALUES (
        'Moment #01',
        'moment-001',
        'Лимитированная унисекс-футболка AH Visuals of Moments с принтом заката над Киевом.',
        85.00,
        true
    )
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_prod1_id;

    -- Product 2: Moment #02 - Podil Morning
    INSERT INTO products (name, slug, description, price, active)
    VALUES (
        'Moment #02',
        'moment-002',
        'Лимитированная унисекс-футболка AH Visuals of Moments с утренней атмосферой Подола.',
        85.00,
        true
    )
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_prod2_id;

    -- Variants for Moment #01
    -- Black / S (12 on_hand)
    INSERT INTO product_variants (product_id, sku, color, size, active)
    VALUES (v_prod1_id, 'AH-M01-BLK-S', 'Black', 'S', true)
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO v_var_id;
    IF v_var_id IS NOT NULL THEN
        INSERT INTO inventory (variant_id, on_hand, reserved) VALUES (v_var_id, 12, 0);
        INSERT INTO stock_movements (variant_id, type, quantity, on_hand_before, on_hand_after, reserved_before, reserved_after, note)
        VALUES (v_var_id, 'INITIAL_STOCK', 12, 0, 12, 0, 0, 'Начальный ввод остатка');
    END IF;

    -- Black / M (10 on_hand)
    INSERT INTO product_variants (product_id, sku, color, size, active)
    VALUES (v_prod1_id, 'AH-M01-BLK-M', 'Black', 'M', true)
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO v_var_id;
    IF v_var_id IS NOT NULL THEN
        INSERT INTO inventory (variant_id, on_hand, reserved) VALUES (v_var_id, 10, 0);
        INSERT INTO stock_movements (variant_id, type, quantity, on_hand_before, on_hand_after, reserved_before, reserved_after, note)
        VALUES (v_var_id, 'INITIAL_STOCK', 10, 0, 10, 0, 0, 'Начальный ввод остатка');
    END IF;

    -- Black / L (8 on_hand)
    INSERT INTO product_variants (product_id, sku, color, size, active)
    VALUES (v_prod1_id, 'AH-M01-BLK-L', 'Black', 'L', true)
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO v_var_id;
    IF v_var_id IS NOT NULL THEN
        INSERT INTO inventory (variant_id, on_hand, reserved) VALUES (v_var_id, 8, 0);
        INSERT INTO stock_movements (variant_id, type, quantity, on_hand_before, on_hand_after, reserved_before, reserved_after, note)
        VALUES (v_var_id, 'INITIAL_STOCK', 8, 0, 8, 0, 0, 'Начальный ввод остатка');
    END IF;

    -- White / S (8 on_hand)
    INSERT INTO product_variants (product_id, sku, color, size, active)
    VALUES (v_prod1_id, 'AH-M01-WHT-S', 'White', 'S', true)
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO v_var_id;
    IF v_var_id IS NOT NULL THEN
        INSERT INTO inventory (variant_id, on_hand, reserved) VALUES (v_var_id, 8, 0);
        INSERT INTO stock_movements (variant_id, type, quantity, on_hand_before, on_hand_after, reserved_before, reserved_after, note)
        VALUES (v_var_id, 'INITIAL_STOCK', 8, 0, 8, 0, 0, 'Начальный ввод остатка');
    END IF;

    -- White / M (15 on_hand)
    INSERT INTO product_variants (product_id, sku, color, size, active)
    VALUES (v_prod1_id, 'AH-M01-WHT-M', 'White', 'M', true)
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO v_var_id;
    IF v_var_id IS NOT NULL THEN
        INSERT INTO inventory (variant_id, on_hand, reserved) VALUES (v_var_id, 15, 0);
        INSERT INTO stock_movements (variant_id, type, quantity, on_hand_before, on_hand_after, reserved_before, reserved_after, note)
        VALUES (v_var_id, 'INITIAL_STOCK', 15, 0, 15, 0, 0, 'Начальный ввод остатка');
    END IF;

    -- Variants for Moment #02
    -- Black / M (14 on_hand)
    INSERT INTO product_variants (product_id, sku, color, size, active)
    VALUES (v_prod2_id, 'AH-M02-BLK-M', 'Black', 'M', true)
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO v_var_id;
    IF v_var_id IS NOT NULL THEN
        INSERT INTO inventory (variant_id, on_hand, reserved) VALUES (v_var_id, 14, 0);
        INSERT INTO stock_movements (variant_id, type, quantity, on_hand_before, on_hand_after, reserved_before, reserved_after, note)
        VALUES (v_var_id, 'INITIAL_STOCK', 14, 0, 14, 0, 0, 'Начальный ввод остатка');
    END IF;

    -- White / L (9 on_hand)
    INSERT INTO product_variants (product_id, sku, color, size, active)
    VALUES (v_prod2_id, 'AH-M02-WHT-L', 'White', 'L', true)
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO v_var_id;
    IF v_var_id IS NOT NULL THEN
        INSERT INTO inventory (variant_id, on_hand, reserved) VALUES (v_var_id, 9, 0);
        INSERT INTO stock_movements (variant_id, type, quantity, on_hand_before, on_hand_after, reserved_before, reserved_after, note)
        VALUES (v_var_id, 'INITIAL_STOCK', 9, 0, 9, 0, 0, 'Начальный ввод остатка');
    END IF;
END $$;
