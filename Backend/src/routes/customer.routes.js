import { Router } from "express";
import verifyAuth from "../middleware/verifyauth.js";
import * as customerController from "../controller/customer.controller.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { getCustomersQuerySchema } from "../validators/customer.validation.js";

const router = Router();

router.get(
  "/",
  verifyAuth,
  validateQuery(getCustomersQuerySchema),
  customerController.getCustomers,
);

const customerRouter= router;
export default customerRouter;