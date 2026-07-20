import * as storeServices from "../service/store.services.js";
import logger from "../utils/logger.js";

export const getStoreDetails = async (req, res) => {
  try {
    const store = await storeServices.getStoreDetails(req.user);

    return res.status(200).json({
      success: true,
      message: "Store fetched successfully",
      store,
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        storeId: req.user.storeId,
      },
      "Failed to fetch store"
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};