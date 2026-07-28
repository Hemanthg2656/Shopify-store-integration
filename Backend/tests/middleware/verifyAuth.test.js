import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

const mockVerifyAccessToken = jest.fn();

jest.unstable_mockModule("../../src/utils/jwt.js", () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

const { default: verifyAuth } = await import("../../src/middleware/verifyauth.js");

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("verifyAuth middleware", () => {
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
  });

  it("should return 401 when no accessToken cookie is present", () => {
    const req = { cookies: {} };
    const res = createMockRes();

    verifyAuth(req, res, next);

    expect(mockVerifyAccessToken).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      code: "ACCESS_TOKEN_MISSING",
      message: "Access token missing",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should attach the decoded user to req.user and call next() on success", () => {
    const req = { cookies: { accessToken: "valid-token" } };
    const res = createMockRes();

    mockVerifyAccessToken.mockReturnValue({
      userId: 1,
      storeId: 2,
      shop: "demo.myshopify.com",
      sessionId: 100,
      role: "admin",
    });

    verifyAuth(req, res, next);

    expect(mockVerifyAccessToken).toHaveBeenCalledWith("valid-token");
    expect(req.user).toEqual({
      userId: 1,
      storeId: 2,
      shop: "demo.myshopify.com",
      sessionId: 100,
      role: "admin",
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 401 with ACCESS_TOKEN_EXPIRED when the token is expired", () => {
    const req = { cookies: { accessToken: "expired-token" } };
    const res = createMockRes();

    mockVerifyAccessToken.mockImplementation(() => {
      throw new jwt.TokenExpiredError("jwt expired", new Date());
    });

    verifyAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      code: "ACCESS_TOKEN_EXPIRED",
      message: "Access token expired",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 with ACCESS_TOKEN_INVALID for any other verification error", () => {
    const req = { cookies: { accessToken: "garbage-token" } };
    const res = createMockRes();

    mockVerifyAccessToken.mockImplementation(() => {
      throw new jwt.JsonWebTokenError("invalid signature");
    });

    verifyAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      code: "ACCESS_TOKEN_INVALID",
      message: "Invalid access token",
    });
    expect(next).not.toHaveBeenCalled();
  });
});