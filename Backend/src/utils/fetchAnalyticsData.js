import { shopifyGraphqlClient } from "./shopifyGraphqlClient.js";
import { GET_ANALYTICS } from "../GraphQL/dashboardQueries.js";

export const fetchAnalyticsData = async ({ shop, accessToken }) => {
  let after = null;

  const orders = [];
  let products = [];

  while (true) {
    const data = await shopifyGraphqlClient({
      shop,
      accessToken,
      query: GET_ANALYTICS,
      variables: {
        first: 250,
        after,
      },
    });

    orders.push(...data.orders.edges);

    if (products.length === 0) {
      products = data.products.edges;
    }

    if (!data.orders.pageInfo.hasNextPage) {
      break;
    }

    after = data.orders.pageInfo.endCursor;
  }

  return {
    orders,
    products,
  };
};