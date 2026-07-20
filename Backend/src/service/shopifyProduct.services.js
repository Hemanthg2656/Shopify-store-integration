import * as tokenRepository from "../repositories/accessToken.repository.js";
import { shopifyGraphqlClient } from "../utils/shopifyGraphqlClient.js";
import { GET_PRODUCTS, GET_PRODUCTS_TYPES } from "../GraphQL/productQueries.js";


export const fetchProducts = async (userData, queryParams = {}) => {
  const { storeId, shop } = userData;

  const tokenResult = await tokenRepository.findByStoreIdFromPool(storeId);

  if (tokenResult.rowCount === 0) {
    const err = new Error("Access token not found");
    err.statusCode = 401;
    throw err;
  }

  const accessToken = tokenResult.rows[0].access_token;

  const {
    search = "",
    status,
    productType,
    sort = "newest",
    cursor = null,
    direction,
    limit = 250,
  } = queryParams;

  const filters = [];

  if (search) filters.push(`title:*${search}*`);
  if (status) filters.push(`status:${status}`);
  if (productType) filters.push(`product_type:${productType}`);

  const searchQuery = filters.join(" ");

  let sortKey = "CREATED_AT";
  let reverse = true;

  switch (sort) {
    case "oldest":
      reverse = false;
      break;

    case "title":
      sortKey = "TITLE";
      reverse = false;
      break;
  }

  const variables = {
    query: searchQuery,
    sortKey,
    reverse,
  };

  if (direction === "next") {
    variables.first = Number(limit);
    variables.after = cursor;
  } else if (direction === "prev") {
    variables.last = Number(limit);
    variables.before = cursor;
  } else {
    variables.first = Number(limit);
  }

  const data = await shopifyGraphqlClient({
    shop,
    accessToken,
    query: GET_PRODUCTS,
    variables,
  });

  const products = data.products.edges.map(({ node }) => ({
    shopifyProductId: node.id,

    title: node.title,

    description: node.descriptionHtml,

    status: node.status,

    productType: node.productType,

    vendor: node.vendor,

    price: node.variants.edges[0]?.node.price ?? null,

    totalInventory: node.totalInventory,

    createdAtShopify: node.createdAt,

    updatedAtShopify: node.updatedAt,

    images: node.images.edges.map(({ node }) => ({
      shopifyImageId: node.id,

      imageUrl: node.url,

      altText: node.altText,

      width: node.width,

      height: node.height,
    })),

    variants: node.variants.edges.map(({ node }) => ({
      shopifyVariantId: node.id,

      title: node.title,

      sku: node.sku,

      barcode: node.barcode,

      price: node.price,

      compareAtPrice: node.compareAtPrice,

      inventoryQuantity: node.inventoryQuantity,

      inventoryPolicy: node.inventoryPolicy,

      taxable: node.taxable,
      availableForSale: node.availableForSale,
      createdAtShopify: node.createdAt,

      updatedAtShopify: node.updatedAt,
    })),
  }));

  return {
    products,
    pageInfo: data.products.pageInfo,
  };
};

export const fetchProductTypes = async (userData) => {
  const { storeId, shop } = userData;

  const tokenResult = await tokenRepository.findByStoreIdFromPool(storeId);

  if (tokenResult.rowCount === 0) {
    throw new Error("Access token not found");
  }

  const accessToken = tokenResult.rows[0].access_token;

  const data = await shopifyGraphqlClient({
    shop,
    accessToken,
    query: GET_PRODUCTS_TYPES,
    variables: {
      first: 100,
      after: null,
    },
  });

  return data.productTypes.edges.map((edge) => edge.node);
};

export const generateShopifyProductLink = async (userData, productId) => {
  const numericId = productId.split("/").pop();

  return `https://${userData.shop}/admin/products/${numericId}`;

};
