import api from "./api";

export const syncProducts = () => api.post("/sync/products");

export const syncOrders = () => api.post("/sync/orders");

export const syncCustomers = () => api.post("/sync/customers");

export const getSyncStatus = async () => {
  const { data } = await api.get("/sync/status");
  return data;
};
