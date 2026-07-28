import { describe, test, expect, beforeAll } from "@jest/globals";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getAccessCookieOptions,
  getRefreshCookieOptions,
} from "../../src/utils/jwt.js";

describe("JWT Utility", () => {
  const payload = {
    userId: 1,
    email: "test@example.com",
  };

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = "access-secret";
    process.env.JWT_REFRESH_SECRET = "refresh-secret";
  });

  describe("generateAccessToken()", () => {
    test("should generate a valid access token", () => {
      const token = generateAccessToken(payload);

      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(20);
    });
  });

  describe("generateRefreshToken()", () => {
    test("should generate a valid refresh token", () => {
      const token = generateRefreshToken(payload);

      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(20);
    });
  });

  describe("verifyAccessToken()", () => {
    test("should verify a valid access token", () => {
      const token = generateAccessToken(payload);

      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    test("should throw for invalid access token", () => {
      expect(() => {
        verifyAccessToken("invalid-token");
      }).toThrow();
    });
  });

  describe("verifyRefreshToken()", () => {
    test("should verify a valid refresh token", () => {
      const token = generateRefreshToken(payload);

      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    test("should throw for invalid refresh token", () => {
      expect(() => {
        verifyRefreshToken("invalid-token");
      }).toThrow();
    });
  });

  describe("getAccessCookieOptions()", () => {
    test("should return correct cookie options in development", () => {
      process.env.NODE_ENV = "development";

      expect(getAccessCookieOptions()).toEqual({
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });
    });

    test("should return secure cookies in production", () => {
      process.env.NODE_ENV = "production";

      expect(getAccessCookieOptions()).toEqual({
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });
    });
  });

  describe("getRefreshCookieOptions()", () => {
    test("should return correct cookie options in development", () => {
      process.env.NODE_ENV = "development";

      expect(getRefreshCookieOptions()).toEqual({
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/api/v1/auth/refresh",
      });
    });

    test("should return secure refresh cookie in production", () => {
      process.env.NODE_ENV = "production";

      expect(getRefreshCookieOptions()).toEqual({
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/api/v1/auth/refresh",
      });
    });
  });
});