import * as tokenRepository from "../repositories/accessToken.repository.js";
import { shopifyGraphqlClient } from "../utils/shopifyGraphqlClient.js";
import { GET_ORDERS } from "../GraphQL/orderQueries.js";



export const fetchOrders = async (userData, queryParams = {}) => {
  const { storeId, shop } = userData;

  const tokenResult = await tokenRepository.findByStoreIdFromPool(storeId);

  if (tokenResult.rowCount === 0) {
    const err = new Error("Access token not found");
    err.statusCode = 401;
    throw err;
  }

  const accessToken = tokenResult.rows[0].access_token;

  const { search = "", limit = 250, cursor = null, direction } = queryParams;

  const variables = {
    query: search,
    sortKey: "PROCESSED_AT",
    reverse: true,
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
    query: GET_ORDERS,
    variables,
  });

  const orders = data.orders.edges.map(({ node }) => ({
    shopifyOrderId: node.id,

    orderNumber: node.name,

    customerName:
      `${node.customer?.firstName ?? ""} ${node.customer?.lastName ?? ""}`.trim() ||
      null,

    customerEmail: node.customer?.email ?? null,

    financialStatus: node.displayFinancialStatus,

    fulfillmentStatus: node.displayFulfillmentStatus,

    currency: node.currentTotalPriceSet.shopMoney.currencyCode,

    totalPrice: node.currentTotalPriceSet.shopMoney.amount,

    createdAt: node.created_at_shopify,

    updatedAt: node.updated_at_shopify,
  }));

  return {
    orders,
    pageInfo: data.orders.pageInfo,
  };
};
