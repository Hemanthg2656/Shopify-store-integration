import * as tokenRepository from "../repositories/accessToken.repository.js";
import { shopifyGraphqlClient } from "../utils/shopifyGraphqlClient.js";
import { GET_STORE_DETAILS } from "../GraphQL/storeQueries.js";

export const getStoreDetails = async (userData) => {
  const { storeId, shop } = userData;

  const tokenResult =
    await tokenRepository.findByStoreIdFromPool(storeId);

  if (tokenResult.rowCount === 0) {
    const err = new Error("Access token not found");
    err.statusCode = 401;
    throw err;
  }

  const accessToken = tokenResult.rows[0].access_token;

  const data = await shopifyGraphqlClient({
    shop,
    accessToken,
    query: GET_STORE_DETAILS,
  });

  const store = data.shop;

  return {
    id: store.id,

    storeName: store.name,

    domain: store.myshopifyDomain,

    primaryDomain: store.primaryDomain?.host,

    email: store.email,

    currency: store.currencyCode,

    timezone: store.ianaTimezone,

    timezoneShort: store.timezoneAbbreviation,

    plan: store.plan.displayName,

    isDevelopmentStore: store.plan.partnerDevelopment,

    isPlus: store.plan.shopifyPlus,

    owner: `${store.billingAddress?.firstName ?? ""} ${
      store.billingAddress?.lastName ?? ""
    }`.trim(),

    address: {
      address1: store.billingAddress?.address1,
      city: store.billingAddress?.city,
      province: store.billingAddress?.province,
      country: store.billingAddress?.country,
      zip: store.billingAddress?.zip,
    },

    createdAt: store.createdAt,
  };
};