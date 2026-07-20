import * as authValidators from "../validators/auth.validation.js";
import * as authServices from "../service/auth.services.js";
import * as sessionServices from "../service/session.services.js";

import { SHOPIFY_STATE_COOKIE } from "../constants/constant.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getAccessCookieOptions,
  getRefreshCookieOptions,
} from "../utils/jwt.js";

export const shopifyInstall = async (req, res) => {
  try {
    const validationResult = authValidators.shopifyInstallSchema.safeParse(
      req.query,
    );
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }
    const { shop } = validationResult.data;
    const state = authServices.generateState();
    res.cookie(SHOPIFY_STATE_COOKIE, state, authServices.getCookieOptions());
    const authorizeUrl = authServices.generateAuthorizeUrl(shop, state);
    return res.redirect(authorizeUrl);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const shopifyCallback = async (req, res) => {
  try {
    const validationResult = authValidators.shopifyCallbackSchema.safeParse(
      req.query,
    );
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues,
      });
    }
    const { code, hmac, host, shop, state, timestamp } = validationResult.data;
    const storedState = req.cookies[SHOPIFY_STATE_COOKIE];
    if (!storedState) {
      return res.status(403).json({
        success: false,
        message: "OAuth state not found",
      });
    }

    if (storedState !== state) {
      return res.status(403).json({
        success: false,
        message: "Invalid OAuth State",
      });
    }
    res.clearCookie(SHOPIFY_STATE_COOKIE, authServices.getCookieOptions());
    const isValidHmac = authServices.verifyHmac(validationResult.data);
    if (!isValidHmac) {
      return res.status(403).json({
        success: false,
        message: "Invalid HMAC signature",
      });
    }
    const tokenResponse = await authServices.exchangeAccessToken(shop, code);
    const shopData = await authServices.getShopData(
      shop,
      tokenResponse.access_token,
    );
    const user = await authServices.findOrCreateUserFromShopify(shopData);
    const { store, token } = await authServices.saveShopifyInstallation(
      user.id,
      shopData,
      tokenResponse,
    );
    const { accessToken, refreshToken } = await authServices.createSession(
      user,
      store,
    );
    res.cookie("accessToken", accessToken, getAccessCookieOptions());
    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());
   
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const refreshTokens = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        code: "REFRESH_TOKEN_MISSING",
        message: "Refresh token is missing",
      });
    }

    const { accessToken, newRefreshToken } =
      await authServices.refreshSession(refreshToken);

    res.cookie("accessToken", accessToken, getAccessCookieOptions());
    res.cookie("refreshToken", newRefreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    console.error(error);
    res.clearCookie("accessToken", getAccessCookieOptions());
    res.clearCookie("refreshToken", getRefreshCookieOptions());
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        code: error.code || "REFRESH_TOKEN_INVALID",
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    await authServices.logout(req.user.sessionId);
    res.clearCookie("accessToken", getAccessCookieOptions());
    res.clearCookie("refreshToken", getRefreshCookieOptions());
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "User returned successfully",
      user: {
        userId: req.user.userId,
        storeId: req.user.storeId,
        sessionId: req.user.sessionId,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
