export const customerTable = `
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,

    store_id INTEGER NOT NULL,

    shopify_customer_id VARCHAR(100) NOT NULL,

    first_name VARCHAR(255),
    last_name VARCHAR(255),

    email VARCHAR(255),
    phone VARCHAR(50),

    orders_count INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,

    state VARCHAR(100),

    created_at_shopify TIMESTAMPTZ,
    updated_at_shopify TIMESTAMPTZ,

    synced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_customer_store
        FOREIGN KEY (store_id)
        REFERENCES connected_stores(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_store_customer
        UNIQUE(store_id, shopify_customer_id)
);
`;