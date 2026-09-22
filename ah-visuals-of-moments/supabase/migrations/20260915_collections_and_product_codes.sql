-- ==============================================================================
-- AH Visuals of Moments: Migration 20260915_collections_and_product_codes
-- 1. Create collections table (REGULAR / LIMITED)
-- 2. Add collection_id (nullable) to products
-- 3. Add immutable product_code to products
-- 4. Enforce immutability via PostgreSQL trigger
-- ==============================================================================

-- 1. Create collections table
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('REGULAR', 'LIMITED')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for collections
CREATE INDEX IF NOT EXISTS idx_collections_type ON collections(type);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(active);

-- 2. Add collection_id to products (nullable for safe migration of legacy/existing records)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'collection_id'
    ) THEN
        ALTER TABLE products 
        ADD COLUMN collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_collection_id ON products(collection_id);

-- 3. Add product_code to products
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'product_code'
    ) THEN
        ALTER TABLE products ADD COLUMN product_code TEXT;
    END IF;
END $$;

-- 4. Safe technical backfill for existing/legacy products without assuming real production codes
-- Uses uppercase slug or technical identifier
UPDATE products 
SET product_code = UPPER(REGEXP_REPLACE(slug, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE product_code IS NULL OR TRIM(product_code) = '';

-- In case any empty remains, fallback to UUID fragment
UPDATE products
SET product_code = 'LEGACY-' || UPPER(SUBSTRING(id::text, 1, 8))
WHERE product_code IS NULL OR TRIM(product_code) = '';

-- Ensure all existing product_code values are strictly trimmed uppercase
UPDATE products
SET product_code = UPPER(TRIM(product_code))
WHERE product_code IS NOT NULL;

-- Enforce NOT NULL and UNIQUE constraints on product_code
ALTER TABLE products ALTER COLUMN product_code SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_products_product_code_upper'
    ) THEN
        ALTER TABLE products 
        ADD CONSTRAINT chk_products_product_code_upper 
        CHECK (product_code = UPPER(product_code));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_products_product_code'
    ) THEN
        ALTER TABLE products ADD CONSTRAINT uq_products_product_code UNIQUE (product_code);
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_product_code_upper ON products (UPPER(product_code));
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);

-- 5. Immutability Trigger: prevent modifying product_code via regular update queries
CREATE OR REPLACE FUNCTION trg_prevent_product_code_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.product_code <> OLD.product_code THEN
        RAISE EXCEPTION 'Поле product_code является неизменяемым (immutable) и не может быть обновлено. Текущее: %, Запрошенное: %', 
            OLD.product_code, NEW.product_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_product_code_immutable ON products;
CREATE TRIGGER trg_products_product_code_immutable
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION trg_prevent_product_code_update();

-- 6. Trigger to keep updated_at in collections table fresh
CREATE OR REPLACE FUNCTION trg_collections_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_collections_updated_at ON collections;
CREATE TRIGGER trg_collections_updated_at
BEFORE UPDATE ON collections
FOR EACH ROW
EXECUTE FUNCTION trg_collections_touch_updated_at();
