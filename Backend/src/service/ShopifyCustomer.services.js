import * as tokenRepository from "../repositories/accessToken.repository.js";
import { shopifyGraphqlClient } from "../utils/shopifyGraphqlClient.js";
import {
  GET_CUSTOMERS,
} from "../GraphQL/customerQueries.js";

export const fetchCustomers = async (
  userData,
  queryParams = {}
) => {
  const { storeId, shop } = userData;

  const tokenResult =
    await tokenRepository.findByStoreIdFromPool(storeId);

  if (tokenResult.rowCount === 0) {
    const err = new Error("Access token not found");
    err.statusCode = 401;
    throw err;
  }

  const accessToken =
    tokenResult.rows[0].access_token;

  const {
    search = "",
    cursor = null,
    direction,
    limit = 250,
  } = queryParams;

  const variables = {
    query: search,
    sortKey: "UPDATED_AT",
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
    query: GET_CUSTOMERS,
    variables,
  });

  const customers = data.customers.edges.map(
    ({ node }) => ({
      shopifyCustomerId: node.id,

      firstName: node.firstName,
      lastName: node.lastName,

      email: node.email,
      phone: node.phone,

      ordersCount: node.numberOfOrders,
      totalSpent: Number(
        node.amountSpent?.amount ?? 0
      ),

      state: node.state,

      createdAtShopify: node.createdAt,
      updatedAtShopify: node.updatedAt,
    })
  );

  return {
    customers,
    pageInfo: data.customers.pageInfo,
  };
};

export const generateShopifyCustomerLink = (
  userData,
  customerId
) => {
  return `https://${userData.shop}/admin/customers/${customerId}`;
};