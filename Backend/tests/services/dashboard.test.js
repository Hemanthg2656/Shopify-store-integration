import { jest } from "@jest/globals";

// ---------------- MOCKS ----------------

const mockFindByStoreIdFromPool = jest.fn();
const mockShopifyGraphqlClient = jest.fn();

const mockFindProducts = jest.fn();
const mockFindOrders = jest.fn();
const mockFindCustomers = jest.fn();
const mockGetTotalRevenue = jest.fn();

const mockFetchAnalyticsData = jest.fn();

const mockBuildMonthlyRevenue = jest.fn();
const mockBuildMonthlyOrders = jest.fn();
const mockBuildOrderSummary = jest.fn();
const mockBuildProductStatus = jest.fn();

jest.unstable_mockModule(
  "../../src/repositories/accessToken.repository.js",
  () => ({
    findByStoreIdFromPool: mockFindByStoreIdFromPool,
  }),
);

jest.unstable_mockModule("../../src/utils/shopifyGraphqlClient.js", () => ({
  shopifyGraphqlClient: mockShopifyGraphqlClient,
}));

jest.unstable_mockModule(
  "../../src/repositories/product.repository.js",
  () => ({
    findProducts: mockFindProducts,
  }),
);

jest.unstable_mockModule("../../src/repositories/order.repository.js", () => ({
  findOrders: mockFindOrders,
  getTotalRevenue: mockGetTotalRevenue,
}));

jest.unstable_mockModule(
  "../../src/repositories/customer.repository.js",
  () => ({
    findCustomers: mockFindCustomers,
  }),
);

jest.unstable_mockModule("../../src/utils/fetchAnalyticsData.js", () => ({
  fetchAnalyticsData: mockFetchAnalyticsData,
}));

jest.unstable_mockModule("../../src/utils/dashboardAnalytics.js", () => ({
  buildMonthlyRevenue: mockBuildMonthlyRevenue,
  buildMonthlyOrders: mockBuildMonthlyOrders,
  buildOrderSummary: mockBuildOrderSummary,
  buildProductStatus: mockBuildProductStatus,
}));

jest.unstable_mockModule("../../src/GraphQL/dashboardQueries.js", () => ({
  GET_DASHBOARD: "GET_DASHBOARD_QUERY",
}));

// ------------ IMPORT AFTER MOCKS ------------

const dashboardService =
  await import("../../src/service/dashboard.services.js");

describe("dashboard.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const userData = {
    storeId: 1,
    shop: "demo.myshopify.com",
  };

  describe("getDashboard", () => {
    it("should return firstSyncRequired when no synced data exists", async () => {
      mockFindProducts.mockResolvedValue({ total: 0 });
      mockFindOrders.mockResolvedValue({ total: 0 });
      mockFindCustomers.mockResolvedValue({ total: 0 });
      mockGetTotalRevenue.mockResolvedValue(0);

      const result = await dashboardService.getDashboard(userData);

      expect(result).toEqual({
        firstSyncRequired: true,
        summary: {
          totalProducts: 0,
          totalOrders: 0,
          totalCustomers: 0,
          totalRevenue: 0,
        },
        recentOrders: [],
        topProducts: [],
      });

      expect(mockFindByStoreIdFromPool).not.toHaveBeenCalled();
    });

    it("should throw 401 when access token is missing", async () => {
      mockFindProducts.mockResolvedValue({ total: 1 });
      mockFindOrders.mockResolvedValue({ total: 1 });
      mockFindCustomers.mockResolvedValue({ total: 1 });
      mockGetTotalRevenue.mockResolvedValue(500);

      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      await expect(dashboardService.getDashboard(userData)).rejects.toThrow(
        "Access token not found",
      );
    });

    it("should attach statusCode 401", async () => {
      mockFindProducts.mockResolvedValue({ total: 1 });
      mockFindOrders.mockResolvedValue({ total: 1 });
      mockFindCustomers.mockResolvedValue({ total: 1 });
      mockGetTotalRevenue.mockResolvedValue(500);

      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      try {
        await dashboardService.getDashboard(userData);
      } catch (err) {
        expect(err.statusCode).toBe(401);
      }
    });

    it("should build dashboard response", async () => {
      mockFindProducts.mockResolvedValue({ total: 5 });
      mockFindOrders.mockResolvedValue({ total: 3 });
      mockFindCustomers.mockResolvedValue({ total: 2 });
      mockGetTotalRevenue.mockResolvedValue(2500);

      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        productsCount: { count: 5 },
        ordersCount: { count: 3 },
        customersCount: { count: 2 },
        orders: {
          edges: [
            {
              node: {
                id: "o1",
                name: "#1001",
                customer: {
                  firstName: "John",
                  lastName: "Doe",
                },
                displayFinancialStatus: "PAID",
                currentTotalPriceSet: {
                  shopMoney: {
                    amount: "100",
                    currencyCode: "USD",
                  },
                },
                createdAt: "2024-01-01",
                lineItems: {
                  edges: [
                    {
                      node: {
                        quantity: 2,
                        originalUnitPriceSet: {
                          shopMoney: {
                            amount: "50",
                          },
                        },
                        product: {
                          id: "p1",
                          title: "Shirt",
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      });

      const result = await dashboardService.getDashboard(userData);

      expect(result.firstSyncRequired).toBe(false);

      expect(result.summary).toEqual({
        totalProducts: 5,
        totalOrders: 3,
        totalCustomers: 2,
        totalRevenue: 2500,
      });

      expect(result.recentOrders).toHaveLength(1);

      expect(result.topProducts).toEqual([
        {
          id: "p1",
          title: "Shirt",
          unitsSold: 2,
          revenue: 100,
        },
      ]);
    });

    it("should return Guest when customer is null", async () => {
      mockFindProducts.mockResolvedValue({ total: 1 });
      mockFindOrders.mockResolvedValue({ total: 1 });
      mockFindCustomers.mockResolvedValue({ total: 1 });
      mockGetTotalRevenue.mockResolvedValue(100);

      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        productsCount: { count: 1 },
        ordersCount: { count: 1 },
        customersCount: { count: 1 },
        orders: {
          edges: [
            {
              node: {
                id: "1",
                name: "#1",
                customer: null,
                displayFinancialStatus: "PAID",
                currentTotalPriceSet: {
                  shopMoney: {
                    amount: "10",
                    currencyCode: "USD",
                  },
                },
                createdAt: "today",
                lineItems: { edges: [] },
              },
            },
          ],
        },
      });

      const result = await dashboardService.getDashboard(userData);

      expect(result.recentOrders[0].customerName).toBe("Guest");
    });

    it("should ignore line items without products", async () => {
      mockFindProducts.mockResolvedValue({ total: 1 });
      mockFindOrders.mockResolvedValue({ total: 1 });
      mockFindCustomers.mockResolvedValue({ total: 1 });
      mockGetTotalRevenue.mockResolvedValue(10);

      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        productsCount: { count: 1 },
        ordersCount: { count: 1 },
        customersCount: { count: 1 },
        orders: {
          edges: [
            {
              node: {
                id: "1",
                name: "#1",
                customer: null,
                displayFinancialStatus: "PAID",
                currentTotalPriceSet: {
                  shopMoney: {
                    amount: "10",
                    currencyCode: "USD",
                  },
                },
                createdAt: "today",
                lineItems: {
                  edges: [
                    {
                      node: {
                        product: null,
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      });

      const result = await dashboardService.getDashboard(userData);

      expect(result.topProducts).toEqual([]);
    });
  });

  describe("getAnalytics", () => {
    it("should throw when access token is missing", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      await expect(dashboardService.getAnalytics(userData)).rejects.toThrow(
        "Access token not found",
      );
    });

    it("should return analytics", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockFetchAnalyticsData.mockResolvedValue({
        orders: ["o1"],
        products: ["p1"],
      });

      mockBuildMonthlyRevenue.mockReturnValue("rev");
      mockBuildMonthlyOrders.mockReturnValue("orders");
      mockBuildOrderSummary.mockReturnValue("summary");
      mockBuildProductStatus.mockReturnValue("status");

      const result = await dashboardService.getAnalytics(userData);

      expect(mockFetchAnalyticsData).toHaveBeenCalledWith({
        shop: "demo.myshopify.com",
        accessToken: "token",
      });

      expect(result).toEqual({
        monthlyRevenue: "rev",
        monthlyOrders: "orders",
        orderSummary: "summary",
        productStatus: "status",
      });
    });
  });
  it("should merge same products in topProducts", async () => {
    mockFindProducts.mockResolvedValue({ total: 1 });
    mockFindOrders.mockResolvedValue({ total: 1 });
    mockFindCustomers.mockResolvedValue({ total: 1 });
    mockGetTotalRevenue.mockResolvedValue(200);

    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "token" }],
    });

    mockShopifyGraphqlClient.mockResolvedValue({
      productsCount: { count: 1 },
      ordersCount: { count: 2 },
      customersCount: { count: 1 },

      orders: {
        edges: [
          {
            node: {
              id: "o1",
              name: "#1",
              customer: null,
              displayFinancialStatus: "PAID",
              currentTotalPriceSet: {
                shopMoney: {
                  amount: "100",
                  currencyCode: "USD",
                },
              },
              createdAt: "today",

              lineItems: {
                edges: [
                  {
                    node: {
                      quantity: 2,
                      originalUnitPriceSet: {
                        shopMoney: {
                          amount: "50",
                        },
                      },
                      product: {
                        id: "p1",
                        title: "Laptop",
                      },
                    },
                  },
                ],
              },
            },
          },

          {
            node: {
              id: "o2",
              name: "#2",
              customer: null,
              displayFinancialStatus: "PAID",
              currentTotalPriceSet: {
                shopMoney: {
                  amount: "100",
                  currencyCode: "USD",
                },
              },
              createdAt: "today",

              lineItems: {
                edges: [
                  {
                    node: {
                      quantity: 3,
                      originalUnitPriceSet: {
                        shopMoney: {
                          amount: "50",
                        },
                      },
                      product: {
                        id: "p1",
                        title: "Laptop",
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    });

    const result = await dashboardService.getDashboard(userData);

    expect(result.topProducts).toEqual([
      {
        id: "p1",
        title: "Laptop",
        unitsSold: 5,
        revenue: 250,
      },
    ]);
  });
  it("should attach statusCode 401 in getAnalytics", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    try {
      await dashboardService.getAnalytics(userData);
    } catch (error) {
      expect(error.statusCode).toBe(401);
    }
  });
  it("should return 401 statusCode when analytics token is missing", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    try {
      await dashboardService.getAnalytics(userData);
    } catch (error) {
      expect(error.message).toBe("Access token not found");
      expect(error.statusCode).toBe(401);
    }
  });
  it("should execute complete getAnalytics flow", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [
        {
          access_token: "shopify-token",
        },
      ],
    });

    mockFetchAnalyticsData.mockResolvedValue({
      orders: [
        {
          id: 1,
        },
      ],
      products: [
        {
          id: 10,
        },
      ],
    });

    mockBuildMonthlyRevenue.mockReturnValue([
      {
        month: "Jan",
        revenue: 100,
      },
    ]);

    mockBuildMonthlyOrders.mockReturnValue([
      {
        month: "Jan",
        orders: 5,
      },
    ]);

    mockBuildOrderSummary.mockReturnValue({
      paid: 5,
    });

    mockBuildProductStatus.mockReturnValue({
      active: 10,
    });

    const result = await dashboardService.getAnalytics({
      storeId: 1,
      shop: "demo.myshopify.com",
    });

    expect(mockFindByStoreIdFromPool).toHaveBeenCalledWith(1);

    expect(mockFetchAnalyticsData).toHaveBeenCalledWith({
      shop: "demo.myshopify.com",
      accessToken: "shopify-token",
    });

    expect(result).toEqual({
      monthlyRevenue: [
        {
          month: "Jan",
          revenue: 100,
        },
      ],
      monthlyOrders: [
        {
          month: "Jan",
          orders: 5,
        },
      ],
      orderSummary: {
        paid: 5,
      },
      productStatus: {
        active: 10,
      },
    });
  });
  it("should sort topProducts by unitsSold descending", async () => {
    mockFindProducts.mockResolvedValue({ total: 2 });
    mockFindOrders.mockResolvedValue({ total: 2 });
    mockFindCustomers.mockResolvedValue({ total: 1 });
    mockGetTotalRevenue.mockResolvedValue(500);

    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "token" }],
    });

    mockShopifyGraphqlClient.mockResolvedValue({
      productsCount: { count: 2 },
      ordersCount: { count: 2 },
      customersCount: { count: 1 },

      orders: {
        edges: [
          {
            node: {
              id: "o1",
              name: "#1",
              customer: null,
              displayFinancialStatus: "PAID",
              currentTotalPriceSet: {
                shopMoney: {
                  amount: "100",
                  currencyCode: "USD",
                },
              },
              createdAt: "today",

              lineItems: {
                edges: [
                  {
                    node: {
                      quantity: 1,
                      originalUnitPriceSet: {
                        shopMoney: {
                          amount: "100",
                        },
                      },
                      product: {
                        id: "p1",
                        title: "Phone",
                      },
                    },
                  },
                  {
                    node: {
                      quantity: 5,
                      originalUnitPriceSet: {
                        shopMoney: {
                          amount: "10",
                        },
                      },
                      product: {
                        id: "p2",
                        title: "Laptop",
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    });

    const result = await dashboardService.getDashboard(userData);

    expect(result.topProducts).toEqual([
      {
        id: "p2",
        title: "Laptop",
        unitsSold: 5,
        revenue: 50,
      },
      {
        id: "p1",
        title: "Phone",
        unitsSold: 1,
        revenue: 100,
      },
    ]);
  });
  it("should handle customer with missing firstName or lastName", async () => {
    mockFindProducts.mockResolvedValue({ total: 1 });
    mockFindOrders.mockResolvedValue({ total: 1 });
    mockFindCustomers.mockResolvedValue({ total: 1 });
    mockGetTotalRevenue.mockResolvedValue(100);

    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "token" }],
    });

    mockShopifyGraphqlClient.mockResolvedValue({
      productsCount: { count: 1 },
      ordersCount: { count: 1 },
      customersCount: { count: 1 },

      orders: {
        edges: [
          {
            node: {
              id: "1",
              name: "#1",

              customer: {
                firstName: null,
                lastName: "Doe",
              },

              displayFinancialStatus: "PAID",

              currentTotalPriceSet: {
                shopMoney: {
                  amount: "10",
                  currencyCode: "USD",
                },
              },

              createdAt: "today",

              lineItems: {
                edges: [],
              },
            },
          },
        ],
      },
    });

    const result = await dashboardService.getDashboard(userData);

    expect(result.recentOrders[0].customerName).toBe("Doe");
  });
  it("should handle customer with only firstName", async () => {
    mockFindProducts.mockResolvedValue({ total: 1 });
    mockFindOrders.mockResolvedValue({ total: 1 });
    mockFindCustomers.mockResolvedValue({ total: 1 });
    mockGetTotalRevenue.mockResolvedValue(100);

    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "token" }],
    });

    mockShopifyGraphqlClient.mockResolvedValue({
      productsCount: { count: 1 },
      ordersCount: { count: 1 },
      customersCount: { count: 1 },

      orders: {
        edges: [
          {
            node: {
              id: "1",
              name: "#1",

              customer: {
                firstName: "John",
                lastName: null,
              },

              displayFinancialStatus: "PAID",

              currentTotalPriceSet: {
                shopMoney: {
                  amount: "10",
                  currencyCode: "USD",
                },
              },

              createdAt: "today",

              lineItems: {
                edges: [],
              },
            },
          },
        ],
      },
    });

    const result = await dashboardService.getDashboard(userData);

    expect(result.recentOrders[0].customerName).toBe("John");
  });
});
