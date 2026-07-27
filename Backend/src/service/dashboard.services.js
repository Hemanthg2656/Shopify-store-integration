import * as tokenRepository from "../repositories/accessToken.repository.js";
import { shopifyGraphqlClient } from "../utils/shopifyGraphqlClient.js";
import { GET_DASHBOARD } from "../GraphQL/dashboardQueries.js";
import { fetchAnalyticsData } from "../utils/fetchAnalyticsData.js";
import * as productRepository from "../repositories/product.repository.js";
import * as orderRepository from "../repositories/order.repository.js";
import * as customerRepository from "../repositories/customer.repository.js";

import {
  buildMonthlyRevenue,
  buildMonthlyOrders,
  buildOrderSummary,
  buildProductStatus,
} from "../utils/dashboardAnalytics.js";

export const getDashboard = async (userData) => {
  const { storeId, shop } = userData;
  const [products, orders, customers, totalRevenue] = await Promise.all([
    productRepository.findProducts(storeId, { page: 1, limit: 1 }),
    orderRepository.findOrders(storeId, { page: 1, limit: 1 }),
    customerRepository.findCustomers(storeId, { page: 1, limit: 1 }),
    orderRepository.getTotalRevenue(storeId),
  ]);

  const hasSyncedData =
    products.total > 0 || orders.total > 0 || customers.total > 0;
  if (!hasSyncedData) {
    return {
      firstSyncRequired: true,
      summary: {
        totalProducts: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0,
      },
      recentOrders: [],
      topProducts: [],
    };
  }
  const tokenResult = await tokenRepository.findByStoreIdFromPool(storeId);
  if (tokenResult.rowCount === 0) {
    const err = new Error("Access token not found");
    err.statusCode = 401;
    throw err;
  }
  const accessToken = tokenResult.rows[0].access_token;
  const data = await shopifyGraphqlClient({
    shop,
    accessToken,
    query: GET_DASHBOARD,
  });
  const productMap = new Map();
  const recentOrders = data.orders.edges.map(({ node }) => {
    node.lineItems.edges.forEach(({ node: item }) => {
      if (!item.product) return;

      const id = item.product.id;

      const existing = productMap.get(id);

      const revenue =
        Number(item.originalUnitPriceSet.shopMoney.amount) * item.quantity;

      if (existing) {
        existing.unitsSold += item.quantity;
        existing.revenue += revenue;
      } else {
        productMap.set(id, {
          id,
          title: item.product.title,
          unitsSold: item.quantity,
          revenue,
        });
      }
    });

    return {
      id: node.id,
      orderNumber: node.name,

      customerName: node.customer
        ? `${node.customer.firstName ?? ""} ${node.customer.lastName ?? ""}`.trim()
        : "Guest",

      financialStatus: node.displayFinancialStatus,

      totalAmount: node.currentTotalPriceSet.shopMoney.amount,

      currency: node.currentTotalPriceSet.shopMoney.currencyCode,

      createdAt: node.createdAt,
    };
  });

  const topProducts = [...productMap.values()]
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);

  return {
    firstSyncRequired: false,
    summary: {
      totalProducts: data.productsCount.count,
      totalOrders: data.ordersCount.count,
      totalCustomers: data.customersCount.count,
      totalRevenue,
    },

    recentOrders,

    topProducts,
  };
};

export const getAnalytics = async (userData) => {
  const { storeId, shop } = userData;

  const tokenResult = await tokenRepository.findByStoreIdFromPool(storeId);

  if (tokenResult.rowCount === 0) {
    const err = new Error("Access token not found");
    err.statusCode = 401;
    throw err;
  }

  const accessToken = tokenResult.rows[0].access_token;

  const { orders, products } = await fetchAnalyticsData({
    shop,
    accessToken,
  });

  return {
    monthlyRevenue: buildMonthlyRevenue(orders),

    monthlyOrders: buildMonthlyOrders(orders),

    orderSummary: buildOrderSummary(orders),

    productStatus: buildProductStatus(products),
  };
};
