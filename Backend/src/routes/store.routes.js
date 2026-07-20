import { Router } from "express";

import verifyAuth from "../middleware/verifyauth.js";
import * as storeController from "../controller/store.controller.js";

const router = Router();

router.get("/", verifyAuth, storeController.getStoreDetails);
const storeRouter = router;

export default storeRouter;