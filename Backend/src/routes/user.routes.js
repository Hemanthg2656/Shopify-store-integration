import { Router } from "express";
import * as userController from "../controller/user.controller.js";
import verifyAuth from "../middleware/verifyauth.js";
import { validateId } from "../middleware/validateId.js";

const router = Router();
router.get("/", verifyAuth, userController.getAllUsers);

router.get(
  "/:userId",
  verifyAuth,
  validateId("userId"),
  userController.getUser,
);

router.patch(
  "/:userId",
  verifyAuth,
  validateId("userId"),
  userController.updateUser,
);

router.delete(
  "/:userId",
  verifyAuth,
  validateId("userId"),
  userController.deleteUser,
);

export default router;
