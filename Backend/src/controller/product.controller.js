import * as productServices from "../service/product.services.js";
import logger from "../utils/logger.js";

export const getProducts = async (req, res) => {
  try {

    const { products, pageInfo } = await productServices.getProducts(
      req.user,
      req.validatedQuery,
    );
  return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      count: products.length,
      pageInfo,
      products,
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        storeId: req.user.storeId,
      },
      "Failed to fetch products",
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const getProductTypes = async (req, res) => {
  try {
    const productTypes = await productServices.getProductTypes(req.user);

    return res.status(200).json({
      success: true,
      message: "Product types fetched successfully",
      count: productTypes.length,
      productTypes,
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        storeId: req.user.storeId,
      },
      "Failed to fetch product types",
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const getProductShopifyLink = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      const err = new Error("Product id is required");
      err.statusCode = 400;
      throw err;
    }

    const url = await productServices.getProductShopifyLink(
      req.user,
      productId,
    );

    return res.status(200).json({
      success: true,
      message: "Product shopifyUrl fetched successfully",
      shopifyUrl: url,
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        storeId: req.user.storeId,
      },
      "Failed to generate Shopify product link",
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};