import pool from "../config/db.js";

export const createSyncLog = async (storeId, syncType, resourceType) => {
  const query = `
    INSERT INTO sync_logs
    (
      store_id,
      sync_type,
      resource_type,
      status
    )
    VALUES
    (
      $1,
      $2,
      $3,
      'RUNNING'
    )
    RETURNING *;
  `;

  return await pool.query(query, [storeId, syncType, resourceType]);
};

export const updateSyncLog = async (
  syncLogId,
  status,
  recordsSynced = 0,
  errorMessage = null,
) => {
  const query = `
    UPDATE sync_logs
    SET
      status = $2,
      records_synced = $3,
      error_message = $4,
      completed_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  return await pool.query(query, [
    syncLogId,
    status,
    recordsSynced,
    errorMessage,
  ]);
};

export const findLatestSyncStatus = async (storeId) => {
  const query = `
    SELECT DISTINCT ON (resource_type)
      resource_type,
      sync_type,
      status,
      records_synced,
      error_message,
      completed_at
    FROM sync_logs
    WHERE store_id = $1
    ORDER BY resource_type, completed_at DESC;
  `;

  return await pool.query(query, [storeId]);
};

export const deleteOldSyncLogs = async () => {
  return await pool.query(`
    DELETE FROM sync_logs
    WHERE created_at < NOW() - INTERVAL '30 days';
  `);
};