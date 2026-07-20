import { Router } from "express";
import verifyAuth from "../middleware/verifyauth.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { validateId } from "../middleware/validateId.js";
import * as productController from "../controller/product.controller.js";
import { getProductsQuerySchema } from "../validators/product.validations.js";

const router = Router();

const productRouter = router;

router.get("/types", verifyAuth, productController.getProductTypes);
router.get(
  "/",
  verifyAuth,
  validateQuery(getProductsQuerySchema),
  productController.getProducts,
);
router.get(
  "/:productId/shopify-link",
  verifyAuth,
  productController.getProductShopifyLink,
);

export default productRouter;
