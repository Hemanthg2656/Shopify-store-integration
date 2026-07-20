export const storeTable = `
CREATE TABLE IF NOT EXISTS connected_stores(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    store_name VARCHAR(255),
    store_domain VARCHAR(255) NOT NULL UNIQUE,
    owner_name VARCHAR(100),
    email VARCHAR(255),
    plan_name VARCHAR(100),
    currency VARCHAR(3),
    time_zone VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
`;
