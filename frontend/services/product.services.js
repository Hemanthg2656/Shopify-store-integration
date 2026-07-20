import api from "./api";

export const getProducts = async (params = {}) => {
  const response = await api.get("/products", {
    params,
  });
  return response.data;
};

export const getProductsTypes = async () => {
  const response = await api.get("/products/types");
  return response.data;
};

export const getProductShopifyLink = async (productId) => {
  const encodedId = encodeURIComponent(productId);

  const response = await api.get(`/products/${encodedId}/shopify-link`);

  return response.data.shopifyUrl;
};
