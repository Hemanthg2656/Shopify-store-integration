import { jest } from "@jest/globals";

const mockQuery = jest.fn();

jest.unstable_mockModule("../../src/config/db.js", () => ({
  default: { query: mockQuery },
}));

const mockEncryptAccessToken = jest.fn();
const mockDecryptAccessToken = jest.fn();

jest.unstable_mockModule("../../src/utils/tokenCrypto.js", () => ({
  encryptAccessToken: mockEncryptAccessToken,
  decryptAccessToken: mockDecryptAccessToken,
}));

const accessTokenRepository = await import(
  "../../src/repositories/accessToken.repository.js"
);

describe("accessToken.repository", () => {
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = { query: jest.fn() };
  });

  describe("create", () => {
    it("should encrypt the token and insert it via the given client", async () => {
      mockEncryptAccessToken.mockReturnValue("encrypted-token");

      mockClient.query.mockResolvedValue({
        rows: [{ id: 1, access_token: "encrypted-token" }],
      });

      const result = await accessTokenRepository.create(mockClient, 1, {
        access_token: "plain-token",
        scope: "read_products",
      });

      expect(mockEncryptAccessToken).toHaveBeenCalledWith("plain-token");
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO access_tokens"),
        [1, "read_products", "encrypted-token"],
      );
      expect(result.rows[0].id).toBe(1);
    });
  });

  describe("update", () => {
    it("should encrypt the token and update it via the given client", async () => {
      mockEncryptAccessToken.mockReturnValue("new-encrypted-token");

      mockClient.query.mockResolvedValue({
        rows: [{ id: 1, access_token: "new-encrypted-token" }],
      });

      const result = await accessTokenRepository.update(mockClient, 1, {
        access_token: "new-plain-token",
        scope: "read_orders",
      });

      expect(mockEncryptAccessToken).toHaveBeenCalledWith("new-plain-token");
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE access_tokens"),
        ["read_orders", "new-encrypted-token", 1],
      );
      expect(result.rows[0].id).toBe(1);
    });
  });

  describe("findByStoreId", () => {
    it("should decrypt the access token when a row is found", async () => {
      mockClient.query.mockResolvedValue({
        rows: [{ id: 1, store_id: 1, access_token: "encrypted-token" }],
      });

      mockDecryptAccessToken.mockReturnValue("plain-token");

      const result = await accessTokenRepository.findByStoreId(mockClient, 1);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE store_id = $1"),
        [1],
      );
      expect(mockDecryptAccessToken).toHaveBeenCalledWith("encrypted-token");
      expect(result.rows[0].access_token).toBe("plain-token");
    });

    it("should not attempt to decrypt when no row is found", async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await accessTokenRepository.findByStoreId(mockClient, 999);

      expect(mockDecryptAccessToken).not.toHaveBeenCalled();
      expect(result.rows).toHaveLength(0);
    });
  });

  describe("findByStoreIdFromPool", () => {
    it("should decrypt the access token when a row is found via the pool", async () => {
      mockQuery.mockResolvedValue({
        rows: [{ id: 1, store_id: 1, access_token: "encrypted-token" }],
      });

      mockDecryptAccessToken.mockReturnValue("plain-token");

      const result = await accessTokenRepository.findByStoreIdFromPool(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE store_id=$1"),
        [1],
      );
      expect(mockDecryptAccessToken).toHaveBeenCalledWith("encrypted-token");
      expect(result.rows[0].access_token).toBe("plain-token");
    });

    it("should not attempt to decrypt when no row is found via the pool", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await accessTokenRepository.findByStoreIdFromPool(999);

      expect(mockDecryptAccessToken).not.toHaveBeenCalled();
      expect(result.rows).toHaveLength(0);
    });
  });
});