import api from "./api";

export const getDashboard = async () => {
  const { data } = await api.get("/dashboard");
  return data;
};

export const getAnalytics = async () => {
  const { data } = await api.get("/dashboard/analytics");
  return data;
};