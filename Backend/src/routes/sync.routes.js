import { Router } from "express";
import verifyAuth from "../middleware/verifyauth.js";
import * as syncController from "../controller/sync.controller.js";

const router = Router();
router.post("/products", verifyAuth, syncController.syncProducts);
router.post("/orders", verifyAuth, syncController.syncOrders);

router.post("/customers", verifyAuth, syncController.syncCustomers);
router.get("/status", verifyAuth, syncController.getSyncStatus);
const syncRouter = router;

export default syncRouter;
