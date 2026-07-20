import { Router } from "express";
import * as authController from "../controller/auth.controller.js";
import verifyAuth from "../middleware/verifyauth.js";
import { authFlowLimiter, refreshLimiter } from "../config/rateLimiter.js";

const router = Router();

router.get("/shopify/install", authFlowLimiter, authController.shopifyInstall);

router.get(
  "/shopify/callback",
  authFlowLimiter,
  authController.shopifyCallback,
);

router.post("/refresh", refreshLimiter, authController.refreshTokens);

router.post("/logout", verifyAuth, authController.logout);
router.get("/me", verifyAuth, authController.getMe);

export default router;
