import jwt from "jsonwebtoken";

const JWT_ALGORITHM = "HS256";

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: "15m",
    issuer: "shopify-integration",
    audience: "shopify-api",
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: "30d",
    issuer: "shopify-integration",
    audience: "shopify-api",
  });
};

export const getAccessCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 15 * 60 * 1000,
});

export const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/api/v1/auth/refresh",
});

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
    algorithms: [JWT_ALGORITHM],
    issuer: "shopify-integration",
    audience: "shopify-api",
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    algorithms: [JWT_ALGORITHM],
    issuer: "shopify-integration",
    audience: "shopify-api",
  });
};