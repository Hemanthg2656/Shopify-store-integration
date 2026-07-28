import { jest } from "@jest/globals";

// ---------- MOCKS ----------

const mockCreate = jest.fn();
const mockFindSessionById = jest.fn();
const mockRevokeActiveSession = jest.fn();
const mockRevokeSession = jest.fn();
const mockUpdateRefreshToken = jest.fn();

jest.unstable_mockModule("../../src/repositories/session.repository.js", () => ({
  create: mockCreate,
  findSessionById: mockFindSessionById,
  revokeActiveSession: mockRevokeActiveSession,
  revokeSession: mockRevokeSession,
  updateRefreshToken: mockUpdateRefreshToken,
}));

// ---------- IMPORT SERVICE AFTER MOCKS ----------

const sessionService = await import("../../src/service/session.services.js");

describe("session.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSession", () => {
    it("should call repository.create with userId and storeId and return its result", async () => {
      const dbResult = {
        rowCount: 1,
        rows: [{ id: 1, user_id: 10, store_id: 20 }],
      };

      mockCreate.mockResolvedValue(dbResult);

      const result = await sessionService.createSession(10, 20);

      expect(mockCreate).toHaveBeenCalledWith(10, 20);
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(result).toEqual(dbResult);
    });

    it("should propagate errors from the repository", async () => {
      mockCreate.mockRejectedValue(new Error("Database error"));

      await expect(sessionService.createSession(10, 20)).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("findSession", () => {
    it("should call repository.findSessionById with sessionId and return its result", async () => {
      const dbResult = {
        rowCount: 1,
        rows: [{ id: 100, revoked_at: null }],
      };

      mockFindSessionById.mockResolvedValue(dbResult);

      const result = await sessionService.findSession(100);

      expect(mockFindSessionById).toHaveBeenCalledWith(100);
      expect(mockFindSessionById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(dbResult);
    });

    it("should return an empty result when session is not found", async () => {
      mockFindSessionById.mockResolvedValue({ rowCount: 0, rows: [] });

      const result = await sessionService.findSession(999);

      expect(result.rowCount).toBe(0);
      expect(result.rows).toEqual([]);
    });

    it("should propagate errors from the repository", async () => {
      mockFindSessionById.mockRejectedValue(new Error("Database error"));

      await expect(sessionService.findSession(100)).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("revokeActiveSession", () => {
    it("should call repository.revokeActiveSession with userId and storeId", async () => {
      mockRevokeActiveSession.mockResolvedValue({ rowCount: 1 });

      const result = await sessionService.revokeActiveSession(10, 20);

      expect(mockRevokeActiveSession).toHaveBeenCalledWith(10, 20);
      expect(mockRevokeActiveSession).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ rowCount: 1 });
    });

    it("should propagate errors from the repository", async () => {
      mockRevokeActiveSession.mockRejectedValue(new Error("Database error"));

      await expect(
        sessionService.revokeActiveSession(10, 20),
      ).rejects.toThrow("Database error");
    });
  });

  describe("revokeSession", () => {
    it("should call repository.revokeSession with sessionId and return its result", async () => {
      const dbResult = {
        rowCount: 1,
        rows: [{ id: 100, revoked_at: new Date() }],
      };

      mockRevokeSession.mockResolvedValue(dbResult);

      const result = await sessionService.revokeSession(100);

      expect(mockRevokeSession).toHaveBeenCalledWith(100);
      expect(mockRevokeSession).toHaveBeenCalledTimes(1);
      expect(result).toEqual(dbResult);
    });

    it("should return an empty result when no active session exists", async () => {
      mockRevokeSession.mockResolvedValue({ rowCount: 0, rows: [] });

      const result = await sessionService.revokeSession(999);

      expect(result.rowCount).toBe(0);
    });

    it("should propagate errors from the repository", async () => {
      mockRevokeSession.mockRejectedValue(new Error("Database error"));

      await expect(sessionService.revokeSession(100)).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("updateRefreshToken", () => {
    it("should call repository.updateRefreshToken with sessionId and refreshToken", async () => {
      const dbResult = {
        rowCount: 1,
        rows: [{ id: 100, refresh_token: "hashed-token" }],
      };

      mockUpdateRefreshToken.mockResolvedValue(dbResult);

      const result = await sessionService.updateRefreshToken(
        100,
        "hashed-token",
      );

      expect(mockUpdateRefreshToken).toHaveBeenCalledWith(
        100,
        "hashed-token",
      );
      expect(mockUpdateRefreshToken).toHaveBeenCalledTimes(1);
      expect(result).toEqual(dbResult);
    });

    it("should propagate errors from the repository", async () => {
      mockUpdateRefreshToken.mockRejectedValue(new Error("Database error"));

      await expect(
        sessionService.updateRefreshToken(100, "hashed-token"),
      ).rejects.toThrow("Database error");
    });
  });
});