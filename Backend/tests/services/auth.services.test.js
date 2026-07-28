import { jest } from "@jest/globals";
import crypto from "crypto";

const mockGenerateAccessToken = jest.fn();
const mockGenerateRefreshToken = jest.fn();
const mockVerifyRefreshToken = jest.fn();

jest.unstable_mockModule("../../src/utils/jwt.js", () => ({
  generateAccessToken: mockGenerateAccessToken,
  generateRefreshToken: mockGenerateRefreshToken,
  verifyRefreshToken: mockVerifyRefreshToken,
}));

const mockHashRefreshToken = jest.fn();

jest.unstable_mockModule("../../src/utils/hash.js", () => ({
  hashRefreshToken: mockHashRefreshToken,
}));

const mockFindByEmail = jest.fn();
const mockCreateUser = jest.fn();
const mockFindById = jest.fn();

jest.unstable_mockModule("../../src/repositories/user.repository.js", () => ({
  findByEmail: mockFindByEmail,
  create: mockCreateUser,
  findById: mockFindById,
}));

const mockFindStoreById = jest.fn();
const mockFindByStoreDomain = jest.fn();
const mockStoreCreate = jest.fn();
const mockStoreUpdate = jest.fn();

jest.unstable_mockModule(
  "../../src/repositories/connectedStore.repository.js",
  () => ({
    findStoreById: mockFindStoreById,
    findByStoreDomain: mockFindByStoreDomain,
    create: mockStoreCreate,
    update: mockStoreUpdate,
  }),
);

const mockFindByStoreId = jest.fn();
const mockTokenCreate = jest.fn();
const mockTokenUpdate = jest.fn();

jest.unstable_mockModule(
  "../../src/repositories/accessToken.repository.js",
  () => ({
    findByStoreId: mockFindByStoreId,
    create: mockTokenCreate,
    update: mockTokenUpdate,
  }),
);

const mockRevokeActiveSession = jest.fn();
const mockCreateSession = jest.fn();
const mockUpdateRefreshToken = jest.fn();
const mockFindSession = jest.fn();
const mockRevokeSession = jest.fn();

jest.unstable_mockModule("../../src/service/session.services.js", () => ({
  revokeActiveSession: mockRevokeActiveSession,
  createSession: mockCreateSession,
  updateRefreshToken: mockUpdateRefreshToken,
  findSession: mockFindSession,
  revokeSession: mockRevokeSession,
}));

const mockConnect = jest.fn();

jest.unstable_mockModule("../../src/config/db.js", () => ({
  default: {
    connect: mockConnect,
  },
}));

// ---------- IMPORT SERVICE AFTER MOCKS ----------

const authService = await import("../../src/service/auth.services.js");

describe("auth.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    process.env.SHOPIFY_API_KEY = "apikey";
    process.env.SHOPIFY_API_SECRET = "secret";
    process.env.SHOPIFY_SCOPES = "read_products";
    process.env.SHOPIFY_REDIRECT_URI = "http://localhost:5000/auth/callback";
    process.env.SHOPIFY_API_VERSION = "2025-10";
    process.env.NODE_ENV = "test";
  });

  describe("generateState", () => {
    it("should generate random 32-char hex string", () => {
      const state = authService.generateState();

      expect(state).toHaveLength(32);
      expect(typeof state).toBe("string");
    });

    it("should generate unique values", () => {
      const a = authService.generateState();
      const b = authService.generateState();

      expect(a).not.toBe(b);
    });
  });

  describe("generateAuthorizeUrl", () => {
    it("should generate correct Shopify OAuth URL", () => {
      const url = authService.generateAuthorizeUrl(
        "test-store.myshopify.com",
        "abc123",
      );

      expect(url).toContain(
        "https://test-store.myshopify.com/admin/oauth/authorize",
      );
      expect(url).toContain("client_id=apikey");
      expect(url).toContain("scope=read_products");
      expect(url).toContain("state=abc123");
    });
  });

  describe("getCookieOptions", () => {
    it("should return cookie configuration", () => {
      const options = authService.getCookieOptions();

      expect(options.httpOnly).toBe(true);
      expect(options.sameSite).toBe("lax");
      expect(options.maxAge).toBe(300000);
      expect(options.secure).toBe(false);
    });

    it("should set secure=true in production", () => {
      process.env.NODE_ENV = "production";

      expect(authService.getCookieOptions().secure).toBe(true);
    });
  });

  describe("verifyHmac", () => {
    it("should return false if hmac missing", () => {
      const result = authService.verifyHmac({
        shop: "abc",
      });

      expect(result).toBe(false);
    });

    it("should reject invalid hmac", () => {
      const result = authService.verifyHmac({
        shop: "abc",
        timestamp: "1",
        hmac: "invalid",
      });

      expect(result).toBe(false);
    });

    it("should accept valid hmac", () => {
      const params = {
        shop: "abc",
        timestamp: "123",
      };
      const message = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&");

      const hmac = crypto
        .createHmac("sha256", "secret")
        .update(message)
        .digest("hex");

      expect(
        authService.verifyHmac({
          ...params,
          hmac,
        }),
      ).toBe(true);
    });
  });

  describe("findOrCreateUserFromShopify", () => {
    it("should return existing user", async () => {
      const user = {
        id: 1,
        email: "a@test.com",
      };

      mockFindByEmail.mockResolvedValue({
        rowCount: 1,
        rows: [user],
      });

      const result = await authService.findOrCreateUserFromShopify({
        shop: {
          email: "a@test.com",
          shop_owner: "John",
        },
      });

      expect(result).toEqual(user);
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it("should create user if not found", async () => {
      mockFindByEmail.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      mockCreateUser.mockResolvedValue({
        rows: [{ id: 10 }],
      });

      const result = await authService.findOrCreateUserFromShopify({
        shop: {
          email: "new@test.com",
          shop_owner: "John",
        },
      });

      expect(mockCreateUser).toHaveBeenCalled();
      expect(result.id).toBe(10);
    });

    it("should throw when email missing", async () => {
      await expect(
        authService.findOrCreateUserFromShopify({
          shop: {
            shop_owner: "John",
          },
        }),
      ).rejects.toThrow("Shop email not found");
    });
  });

  describe("exchangeAccessToken", () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should return access token when Shopify responds successfully", async () => {
      const response = {
        access_token: "shopify-access-token",
        scope: "read_products",
      };

      fetch.mockResolvedValue({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: async () => response,
      });

      const result = await authService.exchangeAccessToken(
        "test-store.myshopify.com",
        "auth-code",
      );

      expect(fetch).toHaveBeenCalledTimes(1);

      expect(fetch).toHaveBeenCalledWith(
        "https://test-store.myshopify.com/admin/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: "apikey",
            client_secret: "secret",
            code: "auth-code",
          }),
        },
      );

      expect(result).toEqual(response);
    });

    it("should throw JSON error returned by Shopify", async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 400,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({
          error_description: "Invalid authorization code",
        }),
      });

      await expect(
        authService.exchangeAccessToken("test-store.myshopify.com", "bad-code"),
      ).rejects.toThrow("Invalid authorization code");
    });

    it("should throw plain text error returned by Shopify", async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        headers: {
          get: () => "text/plain",
        },
        text: async () => "Internal Server Error",
      });

      await expect(
        authService.exchangeAccessToken("test-store.myshopify.com", "bad-code"),
      ).rejects.toThrow("Internal Server Error");
    });

    it("should propagate network errors", async () => {
      fetch.mockRejectedValue(new Error("Network failure"));

      await expect(
        authService.exchangeAccessToken(
          "test-store.myshopify.com",
          "auth-code",
        ),
      ).rejects.toThrow("Network failure");
    });
  });
  describe("saveShopifyInstallation", () => {
    let mockClient;

    beforeEach(() => {
      mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      mockConnect.mockResolvedValue(mockClient);
    });

    it("should create a new store and token", async () => {
      mockFindByStoreDomain.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      mockStoreCreate.mockResolvedValue({
        rows: [{ id: 101, store_domain: "shop.myshopify.com" }],
      });

      mockTokenCreate.mockResolvedValue({
        rows: [{ id: 500 }],
      });

      const result = await authService.saveShopifyInstallation(
        1,
        {
          shop: {
            name: "Demo Store",
            myshopify_domain: "shop.myshopify.com",
            shop_owner: "John",
            email: "john@test.com",
            plan_name: "basic",
            currency: "USD",
            iana_timezone: "Asia/Kolkata",
          },
        },
        {
          access_token: "abc",
          scope: "read_products",
        },
      );

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");

      expect(mockStoreCreate).toHaveBeenCalled();

      expect(mockTokenCreate).toHaveBeenCalled();

      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");

      expect(result.store.id).toBe(101);
      expect(result.token.id).toBe(500);

      expect(mockClient.release).toHaveBeenCalled();
    });

    it("should update existing store and token", async () => {
      mockFindByStoreDomain.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: 50 }],
      });

      mockStoreUpdate.mockResolvedValue({
        rows: [{ id: 50 }],
      });

      mockFindByStoreId.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: 70 }],
      });

      mockTokenUpdate.mockResolvedValue({
        rows: [{ id: 70 }],
      });

      const result = await authService.saveShopifyInstallation(
        1,
        {
          shop: {
            name: "Demo",
            myshopify_domain: "shop.myshopify.com",
            shop_owner: "John",
            email: "john@test.com",
            plan_name: "basic",
            currency: "USD",
            iana_timezone: "Asia/Kolkata",
          },
        },
        {
          access_token: "token",
        },
      );

      expect(mockStoreUpdate).toHaveBeenCalled();

      expect(mockTokenUpdate).toHaveBeenCalled();

      expect(result.store.id).toBe(50);
    });

    it("should create token if store exists but token does not", async () => {
      mockFindByStoreDomain.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: 99 }],
      });

      mockStoreUpdate.mockResolvedValue({
        rows: [{ id: 99 }],
      });

      mockFindByStoreId.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      mockTokenCreate.mockResolvedValue({
        rows: [{ id: 10 }],
      });

      await authService.saveShopifyInstallation(
        1,
        {
          shop: {
            name: "Demo",
            myshopify_domain: "shop.myshopify.com",
            shop_owner: "John",
            email: "john@test.com",
            plan_name: "basic",
            currency: "USD",
            iana_timezone: "Asia/Kolkata",
          },
        },
        {
          access_token: "abc",
        },
      );

      expect(mockTokenCreate).toHaveBeenCalled();
    });

    it("should rollback transaction on error", async () => {
      mockFindByStoreDomain.mockRejectedValue(new Error("Database failed"));

      await expect(
        authService.saveShopifyInstallation(
          1,
          {
            shop: {
              name: "Demo",
              myshopify_domain: "shop.myshopify.com",
              shop_owner: "John",
              email: "john@test.com",
              plan_name: "basic",
              currency: "USD",
              iana_timezone: "Asia/Kolkata",
            },
          },
          {
            access_token: "abc",
          },
        ),
      ).rejects.toThrow("Database failed");

      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");

      expect(mockClient.release).toHaveBeenCalled();
    });
  });
  describe("Shopify API services", () => {
    beforeEach(() => {
      process.env.SHOPIFY_API_KEY = "apikey";
      process.env.SHOPIFY_API_SECRET = "secret";
      process.env.SHOPIFY_API_VERSION = "2025-10";

      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe("exchangeAccessToken()", () => {
      it("should return token response when Shopify returns 200", async () => {
        const mockResponse = {
          access_token: "token123",
          scope: "read_products",
        };

        fetch.mockResolvedValue({
          ok: true,
          headers: {
            get: () => "application/json",
          },
          json: async () => mockResponse,
        });

        const result = await authService.exchangeAccessToken(
          "demo.myshopify.com",
          "oauth-code",
        );

        expect(result).toEqual(mockResponse);

        expect(fetch).toHaveBeenCalledTimes(1);
      });

      it("should throw JSON error returned by Shopify", async () => {
        fetch.mockResolvedValue({
          ok: false,
          status: 401,
          headers: {
            get: () => "application/json",
          },
          json: async () => ({
            error_description: "Invalid authorization code",
          }),
        });

        await expect(
          authService.exchangeAccessToken("demo.myshopify.com", "bad-code"),
        ).rejects.toThrow("Invalid authorization code");
      });

      it("should throw plain text error", async () => {
        fetch.mockResolvedValue({
          ok: false,
          status: 500,
          headers: {
            get: () => "text/plain",
          },
          text: async () => "Internal Error",
        });

        await expect(
          authService.exchangeAccessToken("demo.myshopify.com", "code"),
        ).rejects.toThrow("Internal Error");
      });
    });

    describe("getShopData()", () => {
      it("should return shop data", async () => {
        const shop = {
          shop: {
            id: 1,
            name: "Demo Store",
          },
        };

        fetch.mockResolvedValue({
          ok: true,
          json: async () => shop,
        });

        const result = await authService.getShopData(
          "demo.myshopify.com",
          "token123",
        );

        expect(result).toEqual(shop);
      });

      it("should throw when Shopify returns error", async () => {
        fetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            error: "Unauthorized",
          }),
        });

        await expect(
          authService.getShopData("demo.myshopify.com", "bad-token"),
        ).rejects.toThrow("Unauthorized");
      });
    });
  });
  describe("Shopify API services", () => {
    beforeEach(() => {
      process.env.SHOPIFY_API_KEY = "apikey";
      process.env.SHOPIFY_API_SECRET = "secret";
      process.env.SHOPIFY_API_VERSION = "2025-10";

      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe("exchangeAccessToken()", () => {
      it("should return token response when Shopify returns 200", async () => {
        const mockResponse = {
          access_token: "token123",
          scope: "read_products",
        };

        fetch.mockResolvedValue({
          ok: true,
          headers: {
            get: () => "application/json",
          },
          json: async () => mockResponse,
        });

        const result = await authService.exchangeAccessToken(
          "demo.myshopify.com",
          "oauth-code",
        );

        expect(result).toEqual(mockResponse);

        expect(fetch).toHaveBeenCalledTimes(1);
      });

      it("should throw JSON error returned by Shopify", async () => {
        fetch.mockResolvedValue({
          ok: false,
          status: 401,
          headers: {
            get: () => "application/json",
          },
          json: async () => ({
            error_description: "Invalid authorization code",
          }),
        });

        await expect(
          authService.exchangeAccessToken("demo.myshopify.com", "bad-code"),
        ).rejects.toThrow("Invalid authorization code");
      });

      it("should throw plain text error", async () => {
        fetch.mockResolvedValue({
          ok: false,
          status: 500,
          headers: {
            get: () => "text/plain",
          },
          text: async () => "Internal Error",
        });

        await expect(
          authService.exchangeAccessToken("demo.myshopify.com", "code"),
        ).rejects.toThrow("Internal Error");
      });
    });

    describe("getShopData()", () => {
      it("should return shop data", async () => {
        const shop = {
          shop: {
            id: 1,
            name: "Demo Store",
          },
        };

        fetch.mockResolvedValue({
          ok: true,
          json: async () => shop,
        });

        const result = await authService.getShopData(
          "demo.myshopify.com",
          "token123",
        );

        expect(result).toEqual(shop);
      });

      it("should throw when Shopify returns error", async () => {
        fetch.mockResolvedValue({
          ok: false,
          json: async () => ({
            error: "Unauthorized",
          }),
        });

        await expect(
          authService.getShopData("demo.myshopify.com", "bad-token"),
        ).rejects.toThrow("Unauthorized");
      });
    });
  });
  describe("refreshSession", () => {
    beforeEach(() => {
      mockVerifyRefreshToken.mockReturnValue({
        sessionId: 100,
      });

      mockHashRefreshToken.mockReturnValue("hashed-token");
    });

    it("should refresh session successfully", async () => {
      mockFindSession.mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 100,
            user_id: 1,
            store_id: 2,
            refresh_token: "hashed-token",
            revoked_at: null,
            expires_at: new Date(Date.now() + 60000),
          },
        ],
      });

      mockFindById.mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 1,
            role: "user",
          },
        ],
      });

      mockFindStoreById.mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 2,
            store_domain: "store.myshopify.com",
          },
        ],
      });

      mockRevokeSession.mockResolvedValue({});

      mockCreateSession.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: 999 }],
      });

      mockGenerateAccessToken.mockReturnValue("access-token");
      mockGenerateRefreshToken.mockReturnValue("refresh-token");

      const result = await authService.refreshSession("refresh-token");

      expect(result).toEqual({
        accessToken: "access-token",
        newRefreshToken: "refresh-token",
      });

      expect(mockUpdateRefreshToken).toHaveBeenCalled();
    });

    it("should throw when session not found", async () => {
      mockFindSession.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      await expect(authService.refreshSession("refresh-token")).rejects.toThrow(
        "Invalid refresh token",
      );
    });

    it("should throw when session revoked", async () => {
      mockFindSession.mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 100,
            revoked_at: new Date(),
            expires_at: new Date(Date.now() + 60000),
          },
        ],
      });

      await expect(authService.refreshSession("refresh-token")).rejects.toThrow(
        "Invalid refresh token",
      );
    });

    it("should throw when session expired", async () => {
      mockFindSession.mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 100,
            revoked_at: null,
            expires_at: new Date(Date.now() - 60000),
          },
        ],
      });

      await expect(authService.refreshSession("refresh-token")).rejects.toThrow(
        "Invalid refresh token",
      );
    });

    it("should throw when refresh token hash does not match", async () => {
      mockFindSession.mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 100,
            revoked_at: null,
            expires_at: new Date(Date.now() + 60000),
            refresh_token: "another-hash",
          },
        ],
      });

      await expect(authService.refreshSession("refresh-token")).rejects.toThrow(
        "Invalid session",
      );
    });

    it("should throw when user not found", async () => {
      mockFindSession.mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 100,
            user_id: 1,
            store_id: 2,
            refresh_token: "hashed-token",
            revoked_at: null,
            expires_at: new Date(Date.now() + 60000),
          },
        ],
      });

      mockFindById.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      mockFindStoreById.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: 2 }],
      });

      await expect(authService.refreshSession("refresh-token")).rejects.toThrow(
        "User not found",
      );
    });

    it("should throw when store not found", async () => {
      mockFindSession.mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 100,
            user_id: 1,
            store_id: 2,
            refresh_token: "hashed-token",
            revoked_at: null,
            expires_at: new Date(Date.now() + 60000),
          },
        ],
      });

      mockFindById.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: 1 }],
      });

      mockFindStoreById.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      await expect(authService.refreshSession("refresh-token")).rejects.toThrow(
        "Store not found",
      );
    });

    it("should throw when createSession fails", async () => {
      mockFindSession.mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 100,
            user_id: 1,
            store_id: 2,
            refresh_token: "hashed-token",
            revoked_at: null,
            expires_at: new Date(Date.now() + 60000),
          },
        ],
      });

      mockFindById.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: 1, role: "user" }],
      });

      mockFindStoreById.mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 2,
            store_domain: "store.myshopify.com",
          },
        ],
      });

      mockRevokeSession.mockResolvedValue({});

      mockCreateSession.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      await expect(authService.refreshSession("refresh-token")).rejects.toThrow(
        "unable to create session",
      );
    });
  });
  describe("createSession", () => {
    it("should create a session and return access & refresh tokens", async () => {
      mockRevokeActiveSession.mockResolvedValue();

      mockCreateSession.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: 123 }],
      });

      mockGenerateAccessToken.mockReturnValue("access-token");
      mockGenerateRefreshToken.mockReturnValue("refresh-token");
      mockHashRefreshToken.mockReturnValue("hashed-refresh");

      const user = {
        id: 1,
        role: "admin",
      };

      const store = {
        id: 5,
        store_domain: "demo.myshopify.com",
      };

      const result = await authService.createSession(user, store);

      expect(mockRevokeActiveSession).toHaveBeenCalledWith(1, 5);

      expect(mockCreateSession).toHaveBeenCalledWith(1, 5);

      expect(mockGenerateAccessToken).toHaveBeenCalled();

      expect(mockGenerateRefreshToken).toHaveBeenCalled();

      expect(mockHashRefreshToken).toHaveBeenCalledWith("refresh-token");

      expect(mockUpdateRefreshToken).toHaveBeenCalledWith(
        123,
        "hashed-refresh",
      );

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
    });
    it("should throw if session does not exist", async () => {
      mockVerifyRefreshToken.mockReturnValue({
        sessionId: 100,
      });

      mockFindSession.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      await expect(authService.refreshSession("token")).rejects.toThrow(
        "Invalid refresh token",
      );
    });
    it("should throw if session is revoked", async () => {
      mockVerifyRefreshToken.mockReturnValue({
        sessionId: 100,
      });

      mockFindSession.mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 100,
            revoked_at: new Date(),
          },
        ],
      });

      await expect(authService.refreshSession("token")).rejects.toThrow(
        "Invalid refresh token",
      );
    });
    it("should throw if session is expired", async () => {
      mockVerifyRefreshToken.mockReturnValue({
        sessionId: 100,
      });

      mockFindSession.mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 100,
            revoked_at: null,
            expires_at: new Date(Date.now() - 1000),
          },
        ],
      });

      await expect(authService.refreshSession("token")).rejects.toThrow(
        "Invalid refresh token",
      );
    });
    it("should throw if session creation fails", async () => {
      mockRevokeActiveSession.mockResolvedValue();

      mockCreateSession.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      await expect(
        authService.createSession(
          {
            id: 1,
            role: "user",
          },
          {
            id: 2,
            store_domain: "demo.myshopify.com",
          },
        ),
      ).rejects.toThrow("Unable to create session");
    });
  });
  describe("logout", () => {
    it("should revoke session", async () => {
      mockRevokeSession.mockResolvedValue({
        rowCount: 1,
        rows: [{ id: 1 }],
      });

      const result = await authService.logout(1);

      expect(result.id).toBe(1);
    });

    it("should throw if no active session exists", async () => {
      mockRevokeSession.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      await expect(authService.logout(1)).rejects.toThrow(
        "No active session found",
      );
    });
  });
  it("should use response.error when error_description is missing", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        error: "Shopify Error",
      }),
    });

    await expect(
      authService.exchangeAccessToken("demo.myshopify.com", "code"),
    ).rejects.toThrow("Shopify Error");
  });
  it("should use default error message when no error fields exist", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({}),
    });

    await expect(
      authService.exchangeAccessToken("demo.myshopify.com", "code"),
    ).rejects.toThrow("Failed to exchange access token");
  });
  it("should throw error_description", async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        error_description: "Token expired",
      }),
    });

    await expect(
      authService.getShopData("demo.myshopify.com", "token"),
    ).rejects.toThrow("Token expired");
  });
  it("should throw default shop error", async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    await expect(
      authService.getShopData("demo.myshopify.com", "token"),
    ).rejects.toThrow("Failed to fetch shop data");
  });
});
