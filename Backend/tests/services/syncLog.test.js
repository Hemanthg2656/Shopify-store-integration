import { jest } from "@jest/globals";

const mockCreateSyncLog = jest.fn();
const mockUpdateSyncLog = jest.fn();
const mockFindLatestSyncStatus = jest.fn();

jest.unstable_mockModule("../../src/repositories/sync.repository.js", () => ({
  createSyncLog: mockCreateSyncLog,
  updateSyncLog: mockUpdateSyncLog,
  findLatestSyncStatus: mockFindLatestSyncStatus,
}));

const syncService = await import("../../src/service/syncLog.services.js");

describe("sync.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSyncLog", () => {
    it("should create and return sync log", async () => {
      const row = {
        id: 1,
        store_id: 10,
        sync_type: "MANUAL",
        resource_type: "PRODUCTS",
      };

      mockCreateSyncLog.mockResolvedValue({
        rowCount: 1,
        rows: [row],
      });

      const result = await syncService.createSyncLog(
        10,
        "MANUAL",
        "PRODUCTS",
      );

      expect(mockCreateSyncLog).toHaveBeenCalledWith(
        10,
        "MANUAL",
        "PRODUCTS",
      );

      expect(result).toEqual(row);
    });

    it("should throw 500 when sync log cannot be created", async () => {
      mockCreateSyncLog.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      await expect(
        syncService.createSyncLog(1, "AUTO", "ORDERS"),
      ).rejects.toThrow("Unable to create sync log");
    });

    it("should attach statusCode 500", async () => {
      mockCreateSyncLog.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      try {
        await syncService.createSyncLog(1, "AUTO", "ORDERS");
      } catch (err) {
        expect(err.statusCode).toBe(500);
      }
    });
  });

  describe("updateSyncLog", () => {
    it("should update and return sync log", async () => {
      const row = {
        id: 5,
        status: "SUCCESS",
      };

      mockUpdateSyncLog.mockResolvedValue({
        rowCount: 1,
        rows: [row],
      });

      const result = await syncService.updateSyncLog(
        5,
        "SUCCESS",
        25,
        null,
      );

      expect(mockUpdateSyncLog).toHaveBeenCalledWith(
        5,
        "SUCCESS",
        25,
        null,
      );

      expect(result).toEqual(row);
    });

    it("should use default values for recordsSynced and errorMessage", async () => {
      mockUpdateSyncLog.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: 1 }],
      });

      await syncService.updateSyncLog(1, "FAILED");

      expect(mockUpdateSyncLog).toHaveBeenCalledWith(
        1,
        "FAILED",
        0,
        null,
      );
    });

    it("should throw 404 when sync log does not exist", async () => {
      mockUpdateSyncLog.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      await expect(
        syncService.updateSyncLog(99, "FAILED"),
      ).rejects.toThrow("Sync log not found");
    });

    it("should attach statusCode 404", async () => {
      mockUpdateSyncLog.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      try {
        await syncService.updateSyncLog(99, "FAILED");
      } catch (err) {
        expect(err.statusCode).toBe(404);
      }
    });
  });

  describe("getLatestSyncStatus", () => {
    it("should return latest sync status rows", async () => {
      const rows = [
        {
          id: 1,
          status: "SUCCESS",
        },
      ];

      mockFindLatestSyncStatus.mockResolvedValue({
        rows,
      });

      const result = await syncService.getLatestSyncStatus(10);

      expect(mockFindLatestSyncStatus).toHaveBeenCalledWith(10);
      expect(result).toEqual(rows);
    });
  });
});