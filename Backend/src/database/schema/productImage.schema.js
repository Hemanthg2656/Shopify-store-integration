export const product_images = `
CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    shopify_image_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    position INTEGER,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, shopify_image_id)
);`;
