import { jest } from "@jest/globals";

const mockFindByStoreIdFromPool = jest.fn();

jest.unstable_mockModule(
  "../../src/repositories/accessToken.repository.js",
  () => ({
    findByStoreIdFromPool: mockFindByStoreIdFromPool,
  }),
);

const mockShopifyGraphqlClient = jest.fn();

jest.unstable_mockModule("../../src/utils/shopifyGraphqlClient.js", () => ({
  shopifyGraphqlClient: mockShopifyGraphqlClient,
}));

jest.unstable_mockModule("../../src/GraphQL/orderQueries.js", () => ({
  GET_ORDERS: "GET_ORDERS_QUERY",
}));

// ---------- IMPORT SERVICE AFTER MOCKS ----------

const shopifyOrderService =
  await import("../../src/service/shopifyOrder.services.js");

// ---------- HELPERS ----------

const buildOrderNode = (overrides = {}) => ({
  id: "gid://shopify/Order/1",
  name: "#1001",
  customer: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
  },
  displayFinancialStatus: "PAID",
  displayFulfillmentStatus: "FULFILLED",
  currentTotalPriceSet: {
    shopMoney: {
      amount: "150.00",
      currencyCode: "USD",
    },
  },
  created_at_shopify: "2024-01-01T00:00:00.000Z",
  updated_at_shopify: "2024-01-02T00:00:00.000Z",
  ...overrides,
});

describe("shopifyOrder.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const userData = {
    storeId: 1,
    shop: "demo.myshopify.com",
  };

  it("should throw 401 when access token is not found", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    await expect(shopifyOrderService.fetchOrders(userData, {})).rejects.toThrow(
      "Access token not found",
    );

    expect(mockShopifyGraphqlClient).not.toHaveBeenCalled();
  });

  it("should attach statusCode 401 to the error", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    try {
      await shopifyOrderService.fetchOrders(userData, {});
      throw new Error("Should throw");
    } catch (err) {
      expect(err.message).toBe("Access token not found");
      expect(err.statusCode).toBe(401);
    }
  });

  it("should map Shopify orders correctly", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "token123" }],
    });

    mockShopifyGraphqlClient.mockResolvedValue({
      orders: {
        edges: [{ node: buildOrderNode() }],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    });

    const result = await shopifyOrderService.fetchOrders(userData, {});

    expect(result.orders).toEqual([
      {
        shopifyOrderId: "gid://shopify/Order/1",
        orderNumber: "#1001",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        financialStatus: "PAID",
        fulfillmentStatus: "FULFILLED",
        currency: "USD",
        totalPrice: "150.00",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      },
    ]);

    expect(result.pageInfo).toEqual({
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it("should return null customer name and email when customer is missing", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "token" }],
    });

    mockShopifyGraphqlClient.mockResolvedValue({
      orders: {
        edges: [
          {
            node: buildOrderNode({
              customer: null,
            }),
          },
        ],
        pageInfo: {},
      },
    });

    const result = await shopifyOrderService.fetchOrders(userData, {});

    expect(result.orders[0].customerName).toBeNull();
    expect(result.orders[0].customerEmail).toBeNull();
  });

  it("should use the access token returned by repository", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "secret-token" }],
    });

    mockShopifyGraphqlClient.mockResolvedValue({
      orders: {
        edges: [],
        pageInfo: {},
      },
    });

    await shopifyOrderService.fetchOrders(userData, {});

    expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
      expect.objectContaining({
        shop: "demo.myshopify.com",
        accessToken: "secret-token",
        query: "GET_ORDERS_QUERY",
      }),
    );
  });

  it("should pass search query", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "token" }],
    });

    mockShopifyGraphqlClient.mockResolvedValue({
      orders: {
        edges: [],
        pageInfo: {},
      },
    });

    await shopifyOrderService.fetchOrders(userData, {
      search: "john",
    });

    expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          query: "john",
        }),
      }),
    );
  });

  it("should use first/after when direction is next", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "token" }],
    });

    mockShopifyGraphqlClient.mockResolvedValue({
      orders: {
        edges: [],
        pageInfo: {},
      },
    });

    await shopifyOrderService.fetchOrders(userData, {
      direction: "next",
      cursor: "abc",
      limit: 20,
    });

    expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          first: 20,
          after: "abc",
        }),
      }),
    );
  });

  it("should use last/before when direction is prev", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "token" }],
    });

    mockShopifyGraphqlClient.mockResolvedValue({
      orders: {
        edges: [],
        pageInfo: {},
      },
    });

    await shopifyOrderService.fetchOrders(userData, {
      direction: "prev",
      cursor: "xyz",
      limit: 30,
    });

    expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          last: 30,
          before: "xyz",
        }),
      }),
    );
  });

  it("should default to first=250", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "token" }],
    });

    mockShopifyGraphqlClient.mockResolvedValue({
      orders: {
        edges: [],
        pageInfo: {},
      },
    });

    await shopifyOrderService.fetchOrders(userData, {});

    expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          first: 250,
        }),
      }),
    );
  });

  it("should convert string limit into number", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "token" }],
    });

    mockShopifyGraphqlClient.mockResolvedValue({
      orders: {
        edges: [],
        pageInfo: {},
      },
    });

    await shopifyOrderService.fetchOrders(userData, {
      limit: "50",
    });

    expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          first: 50,
        }),
      }),
    );
  });

  it("should propagate GraphQL client errors", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "token" }],
    });

    mockShopifyGraphqlClient.mockRejectedValue(
      new Error("Shopify request failed"),
    );

    await expect(shopifyOrderService.fetchOrders(userData, {})).rejects.toThrow(
      "Shopify request failed",
    );
  });
  it("should set customerName and customerEmail to null when customer is missing", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "token" }],
    });

    mockShopifyGraphqlClient.mockResolvedValue({
      orders: {
        edges: [
          {
            node: {
              id: "gid://shopify/Order/1",
              name: "#1001",
              customer: null,
              displayFinancialStatus: "PAID",
              displayFulfillmentStatus: "FULFILLED",
              currentTotalPriceSet: {
                shopMoney: {
                  amount: "99.99",
                  currencyCode: "USD",
                },
              },
              created_at_shopify: "2024-01-01",
              updated_at_shopify: "2024-01-02",
            },
          },
        ],
        pageInfo: {},
      },
    });

    const result = await shopifyOrderService.fetchOrders(userData);

    expect(result.orders[0].customerName).toBeNull();
    expect(result.orders[0].customerEmail).toBeNull();
  });
});
