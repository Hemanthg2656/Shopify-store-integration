import cron from "node-cron";
import * as storeRepository from "../repositories/connectedStore.repository.js";
import { syncOrders } from "../service/orderSync.services.js";
import { syncProducts } from "../service/productSync.services.js";
import { syncCustomers } from "../service/customerSync.services.js";

export const startSyncScheduler = async () => {
  cron.schedule("0 */3 * * *", async () => {
    try {
      const stores = await storeRepository.findAllStores();
      for (const store of stores.rows) {
        const userData = {
          storeId: store.id,
          shop: store.store_domain,
        };
        try {
          await syncProducts(userData, "AUTO");
        } catch (err) {
          console.error("Product sync failed", err);
        }

        try {
          await syncOrders(userData, "AUTO");
        } catch (err) {
          console.error("Order sync failed", err);
        }

        try {
          await syncCustomers(userData, "AUTO");
        } catch (err) {
          console.error("Customer sync failed", err);
        }
      }
    } catch (error) {
      console.error(error);
    }
  });
};
