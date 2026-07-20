export const product_variants = `
CREATE TABLE IF NOT EXISTS product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,
    shopify_variant_id TEXT NOT NULL,
    title TEXT,
    sku TEXT,
    barcode TEXT,
    price NUMERIC(12,2),
    compare_at_price NUMERIC(12,2),
    inventory_quantity INTEGER,
    inventory_policy TEXT,
    inventory_management TEXT,
    taxable BOOLEAN,
    requires_shipping BOOLEAN,
    weight NUMERIC(10,2),
    weight_unit TEXT,
    created_at_shopify TIMESTAMPTZ,
    updated_at_shopify TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, shopify_variant_id)
);
`;
