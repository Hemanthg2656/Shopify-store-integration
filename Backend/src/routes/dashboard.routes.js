import { Router } from "express";

import * as dashboardController from "../controller/dashboard.controller.js";
import verifyAuth from "../middleware/verifyauth.js";

const router = Router();

router.get("/", verifyAuth, dashboardController.getDashboard);
router.get("/analytics", verifyAuth, dashboardController.getAnalytics);

const dashboardRouter = router;

export default dashboardRouter;