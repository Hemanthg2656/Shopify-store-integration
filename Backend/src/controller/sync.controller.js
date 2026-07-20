import * as productSyncServices from "../service/productSync.services.js";
import * as orderSyncServices from "../service/orderSync.services.js";
import * as customerSyncServices from "../service/customerSync.services.js";
import * as syncLogServices from "../service/syncLog.services.js";

export const syncProducts = async (req, res, next) => {
  try {
    const result = await productSyncServices.syncProducts(req.user);

    return res.status(200).json({
      success: true,
      message: "Products synced successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const syncOrders = async (req, res, next) => {
  try {
    const result = await orderSyncServices.syncOrders(req.user);

    return res.status(200).json({
      success: true,
      message: "Orders synced successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const syncCustomers = async (req, res, next) => {
  try {
    const result = await customerSyncServices.syncCustomers(req.user);
    return res.status(200).json({
      success: true,
      message: "Customers synced successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const getSyncStatus = async (req, res, next) => {
  try {
    const { storeId } = req.user;

    const logs = await syncLogServices.getLatestSyncStatus(storeId);

    const syncStatus = {
      products: null,
      orders: null,
      customers: null,
    };

    logs.forEach((log) => {
      switch (log.resource_type) {
        case "PRODUCTS":
          syncStatus.products = log;
          break;

        case "ORDERS":
          syncStatus.orders = log;
          break;

        case "CUSTOMERS":
          syncStatus.customers = log;
          break;
      }
    });

    return res.status(200).json({
      success: true,
      syncStatus,
    });
  } catch (error) {
    next(error);
  }
};