import * as orderServices from "../service/order.services.js";
import logger from "../utils/logger.js";

export const getOrders = async (req, res) => {

  try {

    const { orders, pageInfo } =
      await orderServices.getOrders(
        req.user,
        req.validatedQuery
      );

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      count: orders.length,
      pageInfo,
      orders,
    });

  } catch (error) {

    logger.error(
      {
        err: error,
        storeId: req.user.storeId,
      },
      "Failed to fetch orders",
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });

  }

};

export const getOrderShopifyLink = async (
  req,
  res
) => {

  try {

    const { orderId } = req.params;

    const url =
      await orderServices.getOrderShopifyLink(
        req.user,
        orderId,
      );

    return res.status(200).json({
      success: true,
      shopifyUrl: url,
    });

  } catch (error) {

    logger.error(
      {
        err: error,
        storeId: req.user.storeId,
      },
      "Failed to generate Shopify order link",
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });

  }

};