import * as customerServices from "../service/customer.services.js";
import logger from "../utils/logger.js";

export const getCustomers = async (req, res) => {
  try {
    const { customers, pageInfo } =
      await customerServices.getCustomers(req.user, req.validatedQuery);

    return res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      count: customers.length,
      pageInfo,
      customers,
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        storeId: req.user.storeId,
      },
      "Failed to fetch customers"
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};