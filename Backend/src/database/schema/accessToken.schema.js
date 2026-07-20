export const tokenTable = `
CREATE TABLE IF NOT EXISTS access_tokens(
    id SERIAL PRIMARY KEY,
    store_id INTEGER NOT NULL UNIQUE,
    scopes TEXT NOT NULL,
    access_token TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

   CONSTRAINT fk_access_token_store
   FOREIGN KEY (store_id)
   REFERENCES connected_stores(id)
   ON DELETE CASCADE
);
`;
