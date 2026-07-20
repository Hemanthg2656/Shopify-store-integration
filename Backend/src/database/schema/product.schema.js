export const productTable = `
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,

    store_id INTEGER NOT NULL,

    shopify_product_id VARCHAR(100) NOT NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    status VARCHAR(30),
    product_type VARCHAR(255),
    vendor VARCHAR(255),

    price DECIMAL(12,2),

    total_inventory INTEGER DEFAULT 0,

    created_at_shopify TIMESTAMPTZ,
    updated_at_shopify TIMESTAMPTZ,

    synced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_store
        FOREIGN KEY (store_id)
        REFERENCES connected_stores(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_store_product
        UNIQUE (store_id, shopify_product_id)
);
`;