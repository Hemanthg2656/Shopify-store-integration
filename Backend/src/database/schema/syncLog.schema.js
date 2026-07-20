export const syncLogTable = `
CREATE TABLE IF NOT EXISTS sync_logs (
    id SERIAL PRIMARY KEY,

    store_id INTEGER NOT NULL,

    sync_type VARCHAR(20) NOT NULL,
    resource_type VARCHAR(30) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'RUNNING',

    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,

    records_synced INTEGER DEFAULT 0,

    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_store
        FOREIGN KEY (store_id)
        REFERENCES connected_stores(id)
        ON DELETE CASCADE
);
`;