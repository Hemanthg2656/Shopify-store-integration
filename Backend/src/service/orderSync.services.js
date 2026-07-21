import * as syncLogServices from "./syncLog.services.js";
import * as shopifyOrderServices from "./ShopifyOrder.services.js";
import * as orderRepository from "../repositories/order.repository.js";


export const syncOrders = async (userData, syncType = "MANUAL") => {
  const { storeId } = userData;
  const syncLog = await syncLogServices.createSyncLog(
    storeId,
    syncType,
    "ORDERS",
  );

  try {
    const { orders } =
      await shopifyOrderServices.fetchOrders(userData, {
        limit: 250,
      });
    for (const order of orders) {
      await orderRepository.upsertOrder({
        storeId,
        ...order,
      });
    }

    await syncLogServices.updateSyncLog(
      syncLog.id,
      "SUCCESS",
      orders.length,
      null,
    );

    return {
      synced: orders.length,
    };
  } catch (error) {
    await syncLogServices.updateSyncLog(
      syncLog.id,
      "FAILED",
      0,
      error.message,
    );

    throw error;
  }
};