import "./config/env.js";
import pool from "./config/db.js";
import app from "./app.js";
import initDB from "./database/initDB.js";
import { startSyncScheduler } from "./jobs/autoSyncScheduler.js";
import { startCleanupScheduler } from "./jobs/cleanupScheduler.js";

await initDB();

const PORT = process.env.PORT || 5001;

try {
  await pool.query("SELECT NOW()");

  console.log("Database Connected");

  startSyncScheduler();
  startCleanupScheduler();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error("Server startup failed:", error.message);
}