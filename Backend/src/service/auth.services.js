import crypto from "crypto";
import { URL } from "url";

import pool from "../config/db.js";
import * as storeRepository from "../repositories/connectedStore.repository.js";
import * as tokenRepository from "../repositories/accessToken.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import * as sessionServices from "../service/session.services.js";
import { hashRefreshToken } from "../utils/hash.js";

export const generateState = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const generateAuthorizeUrl = (shop, state) => {
  const authorizeUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  authorizeUrl.searchParams.set("client_id", process.env.SHOPIFY_API_KEY);
  authorizeUrl.searchParams.set("scope", process.env.SHOPIFY_SCOPES);
  authorizeUrl.searchParams.set(
    "redirect_uri",
    process.env.SHOPIFY_REDIRECT_URI,
  );
  authorizeUrl.searchParams.set("state", state);

  return authorizeUrl.toString();
};

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 5 * 60 * 1000,
});

export const verifyHmac = (queryParams) => {
  const { hmac, ...params } = queryParams;
  const message = Object.keys(params)
    .sort()
    .map((field) => `${field}=${params[field]}`)
    .join("&");
  const generatedHmac = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(message)
    .digest("hex");

  if (!hmac || hmac.length !== generatedHmac.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(generatedHmac, "utf-8"),
    Buffer.from(hmac, "utf-8"),
  );
};

export const exchangeAccessToken = async (shop, code) => {
  const url = `https://${shop}/admin/oauth/access_token`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });
  const contentType = response.headers.get("content-type");
  let responseData;

  if (contentType?.includes("application/json")) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    const err = new Error(
      typeof responseData === "string"
        ? responseData
        : (responseData.error_description ??
            responseData.error ??
            "Failed to exchange access token"),
    );
    err.statusCode = response.status;
    throw err;
  }
  return responseData;
};

export const getShopData = async (shop, accessToken) => {
  const url = `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/shop.json`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(
      responseData.error_description ||
        responseData.error ||
        "Failed to fetch shop data",
    );
  }

  return responseData;
};

export const saveShopifyInstallation = async (
  userId,
  shopData,
  tokenResponse,
) => {
  const client = await pool.connect();
  let storeResult, tokenResult;
  try {
    await client.query("BEGIN");
    const storeData = {
      userId,
      storeName: shopData.shop.name,
      storeDomain: shopData.shop.myshopify_domain,
      ownerName: shopData.shop.shop_owner,
      email: shopData.shop.email,
      planName: shopData.shop.plan_name,
      currency: shopData.shop.currency,
      timeZone: shopData.shop.iana_timezone,
    };
    const searchData = await storeRepository.findByStoreDomain(
      client,
      storeData.storeDomain,
    );
    if (searchData.rowCount > 0) {
      const storeId = searchData.rows[0].id;

      storeResult = await storeRepository.update(client, storeData);
      const tokenSearch = await tokenRepository.findByStoreId(client, storeId);
      if (tokenSearch.rowCount > 0) {
        tokenResult = await tokenRepository.update(
          client,
          storeId,
          tokenResponse,
        );
      } else {
        tokenResult = await tokenRepository.create(
          client,
          storeId,
          tokenResponse,
        );
      }
    } else {
      storeResult = await storeRepository.create(client, storeData);
      const storeId = storeResult.rows[0].id;
      tokenResult = await tokenRepository.create(
        client,
        storeId,
        tokenResponse,
      );
    }
    await client.query("COMMIT");
    return {
      store: storeResult.rows[0],
      token: tokenResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const findOrCreateUserFromShopify = async (shopData) => {
  const name = shopData.shop.shop_owner;
  const email = shopData.shop.email;
  if (!email) {
    throw new Error("Shop email not found");
  }
  const user = await userRepository.findByEmail(email);
  if (user.rowCount > 0) {
    return user.rows[0];
  } else {
    const result = await userRepository.create(name, email);
    return result.rows[0];
  }
};

export const createSession = async (user, store) => {
  await sessionServices.revokeActiveSession(user.id, store.id);
  const sessionResult = await sessionServices.createSession(user.id, store.id);
  if (sessionResult.rowCount === 0) {
    throw new Error("Unable to create session");
  }
  const session = sessionResult.rows[0];
  const accessPayload = {
    userId: user.id,
    storeId: store.id,
    shop: store.store_domain,
    sessionId: session.id,
    role: user.role,
  };
  const refreshPayload = {
    sessionId: session.id,
  };
  const accessToken = generateAccessToken(accessPayload);
  const refreshToken = generateRefreshToken(refreshPayload);
  const hashedToken = hashRefreshToken(refreshToken);
  await sessionServices.updateRefreshToken(session.id, hashedToken);
  return { accessToken, refreshToken };
};

export const refreshSession = async (refreshToken) => {
  const decodedToken = verifyRefreshToken(refreshToken);

  const sessionResult = await sessionServices.findSession(
    decodedToken.sessionId,
  );

  if (sessionResult.rowCount === 0) {
    const err = new Error("Invalid refresh token");
    err.code = "REFRESH_TOKEN_INVALID";
    err.statusCode = 401;
    throw err;
  }

  const session = sessionResult.rows[0];
  if (session.revoked_at) {
    const err = new Error("Invalid refresh token");
    err.statusCode = 401;
    err.code = "SESSION_REVOKED";
    throw err;
  }
  if (new Date(session.expires_at) < new Date()) {
    const err = new Error("Invalid refresh token");
    err.code = "SESSION_EXPIRED";
    err.statusCode = 401;
    throw err;
  }
  const incomingHash = hashRefreshToken(refreshToken);
  if (
    decodedToken.sessionId !== session.id ||
    incomingHash !== session.refresh_token
  ) {
    const err = new Error("Invalid session");
    err.statusCode = 401;
    throw err;
  }

  const [userResult, storeResult] = await Promise.all([
    userRepository.findById(session.user_id),
    storeRepository.findStoreById(session.store_id),
  ]);

  if (userResult.rowCount === 0) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  if (storeResult.rowCount === 0) {
    const err = new Error("Store not found");
    err.statusCode = 404;
    throw err;
  }

  const user = userResult.rows[0];
  const store = storeResult.rows[0];
  await sessionServices.revokeSession(session.id);
  const result = await sessionServices.createSession(user.id, store.id);
  if (result.rowCount === 0) {
    const err = new Error("unable to create session");
    err.statusCode = 401;
    throw err;
  }
  const accessPayload = {
    userId: user.id,
    storeId: store.id,
    shop: store.store_domain,
    sessionId: result.rows[0].id,
    role: user.role,
  };
  const refreshPayload = {
    sessionId: result.rows[0].id,
  };
  const accessToken = generateAccessToken(accessPayload);
  const newRefreshToken = generateRefreshToken(refreshPayload);
  const hashedToken = hashRefreshToken(newRefreshToken);
  await sessionServices.updateRefreshToken(result.rows[0].id, hashedToken);
  return {
    accessToken,
    newRefreshToken,
  };
};

export const logout = async (sessionId) => {
  const result = await sessionServices.revokeSession(sessionId);
  if (result.rowCount === 0) {
    const err = new Error("No active session found");
    err.statusCode = 400;
    throw err;
  }
  return result.rows[0];
};
