import { Router } from "express";
import * as userController from "../controller/user.controller.js";
import verifyAuth from "../middleware/verifyauth.js";
import { validateId } from "../middleware/validateId.js";
import { authorize } from "../middleware/authorize.js";
import { ownership } from "../middleware/ownership.js";

const router = Router();
router.get("/", verifyAuth, authorize("admin"), userController.getAllUsers);

router.get(
  "/:userId",
  verifyAuth,
  validateId("userId"),
  ownership("userId"),
  userController.getUser,
);

router.patch(
  "/:userId",
  verifyAuth,
  validateId("userId"),
  ownership("userId"),
  userController.updateUser,
);

router.delete(
  "/:userId",
  verifyAuth,
  validateId("userId"),
  ownership("userId"),
  userController.deleteUser,
);

export default router;
