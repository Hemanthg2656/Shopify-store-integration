import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../utils/jwt.js";

const verifyAuth = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(401).json({
      success: false,
      code: "ACCESS_TOKEN_MISSING",
      message: "Access token missing",
    });
  }

  try {
    const decoded = verifyAccessToken(accessToken);

    req.user = {
      userId: decoded.userId,
      storeId: decoded.storeId,
      shop: decoded.shop,
      sessionId: decoded.sessionId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        code: "ACCESS_TOKEN_EXPIRED",
        message: "Access token expired",
      });
    }

    return res.status(401).json({
      success: false,
      code: "ACCESS_TOKEN_INVALID",
      message: "Invalid access token",
    });
  }
};

export default verifyAuth;
