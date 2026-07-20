import cron from "node-cron";

import * as syncRepository from "../repositories/sync.repository.js";
import * as sessionRepository from "../repositories/session.repository.js";

export const startCleanupScheduler = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        const syncResult = await syncRepository.deleteOldSyncLogs();
        const sessionResult = await sessionRepository.deleteExpiredSessions();
      } catch (error) {
        console.error("Cleanup failed:", error);
      }
    },
    {
      timezone: "Asia/Kolkata",
    },
  );
};
