import * as syncLogServices from "./syncLog.services.js";
import * as shopifyCustomerServices from "./ShopifyCustomer.services.js";
import * as customerRepository from "../repositories/customer.repository.js";


export const syncCustomers = async (userData,syncType = "MANUAL") => {
  const { storeId } = userData;
  const syncLog = await syncLogServices.createSyncLog(
    storeId,
    syncType,
    "CUSTOMERS",
  );

  try {
  
    const { customers } =
      await shopifyCustomerServices.fetchCustomers(userData, {
        limit: 250,
      });

    for (const customer of customers) {
      await customerRepository.upsertCustomer({
        storeId,
        ...customer,
      });
    }

    await syncLogServices.updateSyncLog(
      syncLog.id,
      "SUCCESS",
      customers.length,
      null,
    );

    return {
      synced: customers.length,
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