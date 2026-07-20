import api from "./api";

export const getStoreDetails = async () => {
  const { data } = await api.get("/store");
  return data;
};