import * as syncRepository from "../repositories/sync.repository.js";

export const createSyncLog = async (storeId, syncType, resourceType) => {
  const result = await syncRepository.createSyncLog(
    storeId,
    syncType,
    resourceType,
  );

  if (result.rowCount === 0) {
    const err = new Error("Unable to create sync log");
    err.statusCode = 500;
    throw err;
  }

  return result.rows[0];
};

export const updateSyncLog = async (
  syncLogId,
  status,
  recordsSynced = 0,
  errorMessage = null,
) => {
  const result = await syncRepository.updateSyncLog(
    syncLogId,
    status,
    recordsSynced,
    errorMessage,
  );

  if (result.rowCount === 0) {
    const err = new Error("Sync log not found");
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

export const getLatestSyncStatus = async (storeId) => {
  const result = await syncRepository.findLatestSyncStatus(storeId);
  return result.rows;
};
