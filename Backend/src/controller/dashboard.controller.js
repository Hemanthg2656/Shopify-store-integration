import * as dashboardServices from "../service/dashboard.services.js";
import logger from "../utils/logger.js";

export const getDashboard = async (req, res) => {
  try {
    const dashboard = await dashboardServices.getDashboard(req.user);

    return res.status(200).json({
      success: true,
      message: "Dashboard fetched successfully",
      ...dashboard,

    });
  } catch (error) {
    logger.error(
      {
        err: error,
        storeId: req.user.storeId,
      },
      "Failed to fetch dashboard"
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const analytics = await dashboardServices.getAnalytics(req.user);

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};