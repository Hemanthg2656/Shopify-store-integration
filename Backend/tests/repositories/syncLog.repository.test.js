import { jest } from "@jest/globals";

const mockQuery = jest.fn();

jest.unstable_mockModule("../../src/config/db.js", () => ({
  default: { query: mockQuery },
}));

const syncRepository = await import("../../src/repositories/sync.repository.js");

describe("sync.repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSyncLog", () => {
    it("should insert a sync log with RUNNING status", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1, status: "RUNNING" }] });

      const result = await syncRepository.createSyncLog(1, "FULL", "PRODUCTS");

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("'RUNNING'"),
        [1, "FULL", "PRODUCTS"],
      );
      expect(result.rows[0].status).toBe("RUNNING");
    });
  });

  describe("updateSyncLog", () => {
    it("should update status, records synced, and error message with defaults", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1, status: "SUCCESS" }] });

      await syncRepository.updateSyncLog(1, "SUCCESS");

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SET"),
        [1, "SUCCESS", 0, null],
      );
    });

    it("should update with explicit recordsSynced and errorMessage", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1, status: "FAILED" }] });

      await syncRepository.updateSyncLog(1, "FAILED", 42, "Timeout");

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        [1, "FAILED", 42, "Timeout"],
      );
    });
  });

  describe("findLatestSyncStatus", () => {
    it("should query the latest sync status per resource type for a store", async () => {
      mockQuery.mockResolvedValue({
        rows: [{ resource_type: "PRODUCTS", status: "SUCCESS" }],
      });

      const result = await syncRepository.findLatestSyncStatus(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("DISTINCT ON (resource_type)"),
        [1],
      );
      expect(result.rows[0].resource_type).toBe("PRODUCTS");
    });
  });

  describe("deleteOldSyncLogs", () => {
    it("should delete sync logs older than 30 days", async () => {
      mockQuery.mockResolvedValue({ rowCount: 5 });

      const result = await syncRepository.deleteOldSyncLogs();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INTERVAL '30 days'"),
      );
      expect(result.rowCount).toBe(5);
    });
  });
});