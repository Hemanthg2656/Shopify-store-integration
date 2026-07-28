import { jest } from "@jest/globals";

const mockShopifyGraphqlClient = jest.fn();

jest.unstable_mockModule("../../src/utils/shopifyGraphqlClient.js", () => ({
  shopifyGraphqlClient: mockShopifyGraphqlClient,
}));

jest.unstable_mockModule("../../src/GraphQL/dashboardQueries.js", () => ({
  GET_ANALYTICS: "query GetAnalytics { ... }",
}));

const { fetchAnalyticsData } = await import(
  "../../src/utils/fetchAnalyticsData.js"
);

describe("fetchAnalyticsData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return orders and products from a single page when there is no next page", async () => {
    mockShopifyGraphqlClient.mockResolvedValue({
      orders: {
        edges: [{ node: { id: "1" } }, { node: { id: "2" } }],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
      products: {
        edges: [{ node: { id: "p1" } }],
      },
    });

    const result = await fetchAnalyticsData({
      shop: "demo.myshopify.com",
      accessToken: "token",
    });

    expect(mockShopifyGraphqlClient).toHaveBeenCalledTimes(1);
    expect(mockShopifyGraphqlClient).toHaveBeenCalledWith({
      shop: "demo.myshopify.com",
      accessToken: "token",
      query: "query GetAnalytics { ... }",
      variables: { first: 250, after: null },
    });

    expect(result).toEqual({
      orders: [{ node: { id: "1" } }, { node: { id: "2" } }],
      products: [{ node: { id: "p1" } }],
    });
  });

  it("should paginate through multiple pages of orders using the cursor", async () => {
    mockShopifyGraphqlClient
      .mockResolvedValueOnce({
        orders: {
          edges: [{ node: { id: "1" } }],
          pageInfo: { hasNextPage: true, endCursor: "cursor-1" },
        },
        products: { edges: [{ node: { id: "p1" } }] },
      })
      .mockResolvedValueOnce({
        orders: {
          edges: [{ node: { id: "2" } }],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
        products: { edges: [{ node: { id: "p2" } }] },
      });

    const result = await fetchAnalyticsData({
      shop: "demo.myshopify.com",
      accessToken: "token",
    });

    expect(mockShopifyGraphqlClient).toHaveBeenCalledTimes(2);
    expect(mockShopifyGraphqlClient).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ variables: { first: 250, after: "cursor-1" } }),
    );

    expect(result.orders).toEqual([
      { node: { id: "1" } },
      { node: { id: "2" } },
    ]);
  });

  it("should only capture products from the first page even across multiple order pages", async () => {
    mockShopifyGraphqlClient
      .mockResolvedValueOnce({
        orders: {
          edges: [{ node: { id: "1" } }],
          pageInfo: { hasNextPage: true, endCursor: "cursor-1" },
        },
        products: { edges: [{ node: { id: "p1" } }] },
      })
      .mockResolvedValueOnce({
        orders: {
          edges: [{ node: { id: "2" } }],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
        products: { edges: [{ node: { id: "p2" } }] },
      });

    const result = await fetchAnalyticsData({
      shop: "demo.myshopify.com",
      accessToken: "token",
    });

    expect(result.products).toEqual([{ node: { id: "p1" } }]);
  });

  it("should propagate errors from shopifyGraphqlClient", async () => {
    mockShopifyGraphqlClient.mockRejectedValue(new Error("Shopify GraphQL request failed"));

    await expect(
      fetchAnalyticsData({ shop: "demo.myshopify.com", accessToken: "token" }),
    ).rejects.toThrow("Shopify GraphQL request failed");
  });
});