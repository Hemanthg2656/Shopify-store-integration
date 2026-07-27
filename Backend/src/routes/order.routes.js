import { Router } from "express";
import * as orderController from "../controller/order.controller.js";
import verifyAuth from "../middleware/verifyauth.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { getOrdersQuerySchema } from "../validators/order.validation.js";
const router = Router();

router.get(
  "/",
  verifyAuth,
  validateQuery(getOrdersQuerySchema),
  orderController.getOrders,
);

router.get(
  "/:orderId/shopify-link",
  verifyAuth,
  orderController.getOrderShopifyLink,
);
const orderRouter = router;
export default orderRouter;
