export const orderTable = `
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,

    store_id INTEGER NOT NULL,

    shopify_order_id VARCHAR(100) NOT NULL,

    order_number VARCHAR(100),

    customer_name VARCHAR(255),
    customer_email VARCHAR(255),

    financial_status VARCHAR(50),
    fulfillment_status VARCHAR(50),

    currency VARCHAR(20),

    total_price DECIMAL(12,2),

    created_at_shopify TIMESTAMPTZ,
    updated_at_shopify TIMESTAMPTZ,

    synced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_store
        FOREIGN KEY (store_id)
        REFERENCES connected_stores(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_store_order
        UNIQUE (store_id, shopify_order_id)
);
`;