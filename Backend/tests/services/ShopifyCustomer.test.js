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

jest.unstable_mockModule("../../src/GraphQL/customerQueries.js", () => ({
  GET_CUSTOMERS: "GET_CUSTOMERS_QUERY",
}));

const customerService =
  await import("../../src/service/shopifyCustomer.services.js");

describe("shopifyCustomer.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const userData = {
    storeId: 1,
    shop: "demo.myshopify.com",
  };

  describe("fetchCustomers", () => {
    it("should throw 401 when access token is not found", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      await expect(
        customerService.fetchCustomers(userData, {}),
      ).rejects.toThrow("Access token not found");

      expect(mockShopifyGraphqlClient).not.toHaveBeenCalled();
    });

    it("should attach statusCode 401 to the error", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      try {
        await customerService.fetchCustomers(userData, {});
      } catch (err) {
        expect(err.statusCode).toBe(401);
        expect(err.message).toBe("Access token not found");
      }
    });

    it("should map customers correctly", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token123" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        customers: {
          edges: [
            {
              node: {
                id: "gid://shopify/Customer/1",
                firstName: "John",
                lastName: "Doe",
                email: "john@test.com",
                phone: "1234567890",
                numberOfOrders: 5,
                amountSpent: {
                  amount: "120.50",
                },
                state: "ENABLED",
                createdAt: "2024-01-01",
                updatedAt: "2024-01-02",
              },
            },
          ],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      });

      const result = await customerService.fetchCustomers(userData);

      expect(result.customers).toEqual([
        {
          shopifyCustomerId: "gid://shopify/Customer/1",
          firstName: "John",
          lastName: "Doe",
          email: "john@test.com",
          phone: "1234567890",
          ordersCount: 5,
          totalSpent: 120.5,
          state: "ENABLED",
          createdAtShopify: "2024-01-01",
          updatedAtShopify: "2024-01-02",
        },
      ]);

      expect(result.pageInfo).toEqual({
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it("should use search query", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        customers: {
          edges: [],
          pageInfo: {},
        },
      });

      await customerService.fetchCustomers(userData, {
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

    it("should use next pagination", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        customers: {
          edges: [],
          pageInfo: {},
        },
      });

      await customerService.fetchCustomers(userData, {
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

    it("should use previous pagination", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        customers: {
          edges: [],
          pageInfo: {},
        },
      });

      await customerService.fetchCustomers(userData, {
        direction: "prev",
        cursor: "xyz",
        limit: 15,
      });

      expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            last: 15,
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
        customers: {
          edges: [],
          pageInfo: {},
        },
      });

      await customerService.fetchCustomers(userData);

      expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            first: 250,
          }),
        }),
      );
    });

    it("should convert string limit to number", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        customers: {
          edges: [],
          pageInfo: {},
        },
      });

      await customerService.fetchCustomers(userData, {
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

    it("should propagate graphql errors", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockRejectedValue(new Error("GraphQL failed"));

      await expect(customerService.fetchCustomers(userData)).rejects.toThrow(
        "GraphQL failed",
      );
    });
  });

  describe("generateShopifyCustomerLink", () => {
    it("should generate customer admin link", () => {
      const link = customerService.generateShopifyCustomerLink(
        { shop: "demo.myshopify.com" },
        "12345",
      );

      expect(link).toBe("https://demo.myshopify.com/admin/customers/12345");
    });
  });
  it("should set totalSpent to 0 when amountSpent is null", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "token" }],
    });

    mockShopifyGraphqlClient.mockResolvedValue({
      customers: {
        edges: [
          {
            node: {
              id: "1",
              firstName: "John",
              lastName: "Doe",
              email: "john@test.com",
              phone: null,
              numberOfOrders: 0,
              amountSpent: null,
              state: "ENABLED",
              createdAt: "2024",
              updatedAt: "2024",
            },
          },
        ],
        pageInfo: {},
      },
    });

    const result = await customerService.fetchCustomers(userData);

    expect(result.customers[0].totalSpent).toBe(0);
  });
});
