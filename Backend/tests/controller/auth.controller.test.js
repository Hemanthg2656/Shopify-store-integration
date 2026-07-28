import { jest } from "@jest/globals";

// ---------- MOCKS ----------

const mockGenerateState = jest.fn();
const mockGetCookieOptions = jest.fn();
const mockGenerateAuthorizeUrl = jest.fn();
const mockVerifyHmac = jest.fn();
const mockExchangeAccessToken = jest.fn();
const mockGetShopData = jest.fn();
const mockFindOrCreateUserFromShopify = jest.fn();
const mockSaveShopifyInstallation = jest.fn();
const mockCreateSession = jest.fn();
const mockRefreshSession = jest.fn();
const mockLogoutService = jest.fn();

jest.unstable_mockModule("../../src/service/auth.services.js", () => ({
  generateState: mockGenerateState,
  getCookieOptions: mockGetCookieOptions,
  generateAuthorizeUrl: mockGenerateAuthorizeUrl,
  verifyHmac: mockVerifyHmac,
  exchangeAccessToken: mockExchangeAccessToken,
  getShopData: mockGetShopData,
  findOrCreateUserFromShopify: mockFindOrCreateUserFromShopify,
  saveShopifyInstallation: mockSaveShopifyInstallation,
  createSession: mockCreateSession,
  refreshSession: mockRefreshSession,
  logout: mockLogoutService,
}));

jest.unstable_mockModule("../../src/service/session.services.js", () => ({
  revokeActiveSession: jest.fn(),
  createSession: jest.fn(),
  updateRefreshToken: jest.fn(),
  findSession: jest.fn(),
  revokeSession: jest.fn(),
}));

const mockGetAccessCookieOptions = jest.fn();
const mockGetRefreshCookieOptions = jest.fn();

jest.unstable_mockModule("../../src/utils/jwt.js", () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  getAccessCookieOptions: mockGetAccessCookieOptions,
  getRefreshCookieOptions: mockGetRefreshCookieOptions,
}));

// ---------- IMPORT CONTROLLER AFTER MOCKS ----------

const authController = await import("../../src/controller/auth.controller.js");

// ---------- HELPERS ----------

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

describe("auth.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCookieOptions.mockReturnValue({ httpOnly: true });
    mockGetAccessCookieOptions.mockReturnValue({
      httpOnly: true,
      maxAge: 900000,
    });
    mockGetRefreshCookieOptions.mockReturnValue({
      httpOnly: true,
      maxAge: 2592000000,
    });
  });

  describe("shopifyInstall", () => {
    it("should return 400 when shop query param fails validation", async () => {
      const req = { query: { shop: "not-a-valid-domain" } };
      const res = createMockRes();

      await authController.shopifyInstall(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Validation failed",
        }),
      );
    });

    it("should set the state cookie and redirect to the Shopify authorize URL", async () => {
      const req = { query: { shop: "demo-store.myshopify.com" } };
      const res = createMockRes();

      mockGenerateState.mockReturnValue("random-state");
      mockGenerateAuthorizeUrl.mockReturnValue(
        "https://demo-store.myshopify.com/admin/oauth/authorize?state=random-state",
      );

      await authController.shopifyInstall(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        "shopify_oauth_state",
        "random-state",
        { httpOnly: true },
      );
      expect(res.redirect).toHaveBeenCalledWith(
        "https://demo-store.myshopify.com/admin/oauth/authorize?state=random-state",
      );
    });

    it("should return 500 when an unexpected error is thrown", async () => {
      const req = { query: { shop: "demo-store.myshopify.com" } };
      const res = createMockRes();

      mockGenerateState.mockImplementation(() => {
        throw new Error("Unexpected");
      });

      await authController.shopifyInstall(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error",
      });
    });
  });

  describe("shopifyCallback", () => {
    const validQuery = {
      code: "auth-code",
      shop: "demo-store.myshopify.com",
      state: "matching-state",
      hmac: "hmac-value",
      host: "host-value",
      timestamp: "1700000000",
    };

    it("should return 400 when query params fail validation", async () => {
      const req = { query: { ...validQuery, shop: "invalid" }, cookies: {} };
      const res = createMockRes();

      await authController.shopifyCallback(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Validation failed",
        }),
      );
    });

    it("should return 403 when no stored OAuth state cookie exists", async () => {
      const req = { query: validQuery, cookies: {} };
      const res = createMockRes();

      await authController.shopifyCallback(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "OAuth state not found",
      });
    });

    it("should return 403 when the stored state does not match", async () => {
      const req = {
        query: validQuery,
        cookies: { shopify_oauth_state: "different-state" },
      };
      const res = createMockRes();

      await authController.shopifyCallback(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid OAuth State",
      });
    });

    it("should return 403 when HMAC verification fails", async () => {
      const req = {
        query: validQuery,
        cookies: { shopify_oauth_state: "matching-state" },
      };
      const res = createMockRes();

      mockVerifyHmac.mockReturnValue(false);

      await authController.shopifyCallback(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid HMAC signature",
      });
    });

    it("should complete the OAuth flow and redirect to the frontend dashboard", async () => {
      process.env.FRONTEND_URL = "https://app.example.com";

      const req = {
        query: validQuery,
        cookies: { shopify_oauth_state: "matching-state" },
      };
      const res = createMockRes();

      mockVerifyHmac.mockReturnValue(true);
      mockExchangeAccessToken.mockResolvedValue({
        access_token: "shopify-token",
      });
      mockGetShopData.mockResolvedValue({ shop: { email: "a@test.com" } });
      mockFindOrCreateUserFromShopify.mockResolvedValue({ id: 1 });
      mockSaveShopifyInstallation.mockResolvedValue({
        store: { id: 2 },
        token: { id: 3 },
      });
      mockCreateSession.mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });

      await authController.shopifyCallback(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith("shopify_oauth_state", {
        httpOnly: true,
      });
      expect(res.cookie).toHaveBeenCalledWith("accessToken", "access-token", {
        httpOnly: true,
        maxAge: 900000,
      });
      expect(res.cookie).toHaveBeenCalledWith("refreshToken", "refresh-token", {
        httpOnly: true,
        maxAge: 2592000000,
      });
      expect(res.redirect).toHaveBeenCalledWith(
        "https://app.example.com/dashboard",
      );
    });

    it("should return the error's statusCode when the service throws one", async () => {
      const req = {
        query: validQuery,
        cookies: { shopify_oauth_state: "matching-state" },
      };
      const res = createMockRes();

      mockVerifyHmac.mockReturnValue(true);
      const error = new Error("Shop email not found");
      error.statusCode = 422;
      mockExchangeAccessToken.mockRejectedValue(error);

      await authController.shopifyCallback(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Shop email not found",
      });
    });

    it("should default to 400 when the thrown error has no statusCode", async () => {
      const req = {
        query: validQuery,
        cookies: { shopify_oauth_state: "matching-state" },
      };
      const res = createMockRes();

      mockVerifyHmac.mockReturnValue(true);
      mockExchangeAccessToken.mockRejectedValue(new Error("Network failure"));

      await authController.shopifyCallback(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Network failure",
      });
    });
  });

  describe("refreshTokens", () => {
    it("should return 401 when no refresh token cookie is present", async () => {
      const req = { cookies: {} };
      const res = createMockRes();

      await authController.refreshTokens(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: "REFRESH_TOKEN_MISSING",
        message: "Refresh token is missing",
      });
    });

    it("should refresh the session and set new cookies on success", async () => {
      const req = { cookies: { refreshToken: "old-refresh-token" } };
      const res = createMockRes();

      mockRefreshSession.mockResolvedValue({
        accessToken: "new-access-token",
        newRefreshToken: "new-refresh-token",
      });

      await authController.refreshTokens(req, res);

      expect(mockRefreshSession).toHaveBeenCalledWith("old-refresh-token");
      expect(res.cookie).toHaveBeenCalledWith(
        "accessToken",
        "new-access-token",
        expect.any(Object),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "new-refresh-token",
        expect.any(Object),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Access token refreshed successfully",
      });
    });

    it("should clear cookies and return the error's statusCode/code when provided", async () => {
      const req = { cookies: { refreshToken: "bad-token" } };
      const res = createMockRes();

      const error = new Error("Invalid session");
      error.statusCode = 401;
      error.code = "SESSION_INVALID";
      mockRefreshSession.mockRejectedValue(error);

      await authController.refreshTokens(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        "accessToken",
        expect.any(Object),
      );
      expect(res.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(Object),
      );
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: "SESSION_INVALID",
        message: "Invalid session",
      });
    });

    it("should default to REFRESH_TOKEN_INVALID code when the error has no code", async () => {
      const req = { cookies: { refreshToken: "bad-token" } };
      const res = createMockRes();

      const error = new Error("Invalid refresh token");
      error.statusCode = 403;
      mockRefreshSession.mockRejectedValue(error);

      await authController.refreshTokens(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        code: "REFRESH_TOKEN_INVALID",
        message: "Invalid refresh token",
      });
    });

    it("should return 500 when the thrown error has no statusCode", async () => {
      const req = { cookies: { refreshToken: "bad-token" } };
      const res = createMockRes();

      mockRefreshSession.mockRejectedValue(new Error("Database error"));

      await authController.refreshTokens(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error",
      });
    });
  });

  describe("logout", () => {
    it("should clear cookies and return 200 on success", async () => {
      const req = { user: { sessionId: 100 } };
      const res = createMockRes();

      mockLogoutService.mockResolvedValue({ id: 100 });

      await authController.logout(req, res);

      expect(mockLogoutService).toHaveBeenCalledWith(100);
      expect(res.clearCookie).toHaveBeenCalledWith(
        "accessToken",
        expect.any(Object),
      );
      expect(res.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(Object),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Logged out successfully",
      });
    });

    it("should return the error's statusCode when provided", async () => {
      const req = { user: { sessionId: 100 } };
      const res = createMockRes();

      const error = new Error("No active session found");
      error.statusCode = 404;
      mockLogoutService.mockRejectedValue(error);

      await authController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "No active session found",
      });
    });

    it("should return 500 when the thrown error has no statusCode", async () => {
      const req = { user: { sessionId: 100 } };
      const res = createMockRes();

      mockLogoutService.mockRejectedValue(new Error("Database error"));

      await authController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error",
      });
    });
  });

  describe("getMe", () => {
    it("should return the current user's session info", async () => {
      const req = {
        user: { userId: 1, storeId: 2, sessionId: 100 },
      };
      const res = createMockRes();

      await authController.getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User returned successfully",
        user: { userId: 1, storeId: 2, sessionId: 100 },
      });
    });
    it("should return the error's statusCode when an unexpected error is thrown with one", async () => {
      const req = { user: { userId: 1, storeId: 2, sessionId: 100 } };
      const res = createMockRes();

      const error = new Error("Unexpected failure");
      error.statusCode = 422;

      res.status = jest
        .fn()
        .mockImplementationOnce(() => {
          throw error;
        })
        .mockReturnValue(res);

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await authController.getMe(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenLastCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unexpected failure",
      });

      consoleErrorSpy.mockRestore();
    });

    it("should default to 500 when an unexpected error has no statusCode", async () => {
      const req = { user: { userId: 1, storeId: 2, sessionId: 100 } };
      const res = createMockRes();

      res.status = jest
        .fn()
        .mockImplementationOnce(() => {
          throw new Error("Unexpected failure");
        })
        .mockReturnValue(res);

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await authController.getMe(req, res);

      expect(res.status).toHaveBeenLastCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error",
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
