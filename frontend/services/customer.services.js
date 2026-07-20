import api from "./api";

export const getCustomers = async (params) => {
  const response = await api.get("/customers", {
    params,
  });

  return response.data;
};