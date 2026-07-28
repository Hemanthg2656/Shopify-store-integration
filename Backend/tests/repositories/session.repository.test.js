import { jest } from "@jest/globals";

const mockQuery = jest.fn();

jest.unstable_mockModule("../../src/config/db.js", () => ({
  default: { query: mockQuery },
}));

const sessionRepository = await import("../../src/repositories/session.repository.js");

describe("session.repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should insert a session for the user/store with a 30-day expiry", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1, user_id: 5, store_id: 2 }] });

      const result = await sessionRepository.create(5, 2);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INTERVAL '30 days'"),
        [5, 2],
      );
      expect(result.rows[0].id).toBe(1);
    });
  });

  describe("findSessionById", () => {
    it("should query a non-revoked session by id", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1, revoked_at: null }] });

      const result = await sessionRepository.findSessionById(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("revoked_at IS NULL"),
        [1],
      );
      expect(result.rows[0].id).toBe(1);
    });
  });

  describe("updateRefreshToken", () => {
    it("should update the refresh token for a session", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1, refresh_token: "hashed" }] });

      const result = await sessionRepository.updateRefreshToken(1, "hashed");

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SET refresh_token = $2"),
        [1, "hashed"],
      );
      expect(result.rows[0].refresh_token).toBe("hashed");
    });
  });

  describe("revokeActiveSession", () => {
    it("should revoke the active session for a user/store", async () => {
      mockQuery.mockResolvedValue({ rowCount: 1 });

      await sessionRepository.revokeActiveSession(5, 2);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SET revoked_at = NOW()"),
        [5, 2],
      );
    });
  });

  describe("revokeSession", () => {
    it("should revoke a session by id and return the revoked row", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1, revoked_at: new Date() }] });

      const result = await sessionRepository.revokeSession(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = $1"),
        [1],
      );
      expect(result.rows[0].id).toBe(1);
    });
  });

  describe("deleteExpiredSessions", () => {
    it("should delete sessions past their expiry", async () => {
      mockQuery.mockResolvedValue({ rowCount: 3 });

      const result = await sessionRepository.deleteExpiredSessions();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("expires_at < NOW()"),
      );
      expect(result.rowCount).toBe(3);
    });
  });
});