import { jest } from "@jest/globals";

// ---------- MOCKS ----------

const mockFindCustomers = jest.fn();

jest.unstable_mockModule("../../src/repositories/customer.repository.js", () => ({
  findCustomers: mockFindCustomers,
}));

// ---------- IMPORT SERVICE AFTER MOCKS ----------

const customerService = await import("../../src/service/customer.services.js");

describe("customer.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCustomerShopifyLink", () => {
    it("should build the Shopify admin link from a numeric-suffixed gid", () => {
      const userData = { shop: "demo.myshopify.com" };
      const link = customerService.getCustomerShopifyLink(
        userData,
        "gid://shopify/Customer/123",
      );

      expect(link).toBe("https://demo.myshopify.com/admin/customers/123");
    });

    it("should just append a plain id if no slashes are present", () => {
      const userData = { shop: "demo.myshopify.com" };
      const link = customerService.getCustomerShopifyLink(userData, "123");

      expect(link).toBe("https://demo.myshopify.com/admin/customers/123");
    });
  });

  describe("getCustomers", () => {
    const userData = { storeId: 1, shop: "demo.myshopify.com" };

    it("should return an empty customers array and zeroed pageInfo when no rows found", async () => {
      mockFindCustomers.mockResolvedValue({
        rows: [],
        total: 0,
      });

      const result = await customerService.getCustomers(userData, {
        page: 1,
        limit: 10,
      });

      expect(mockFindCustomers).toHaveBeenCalledWith(1, { page: 1, limit: 10 });

      expect(result).toEqual({
        customers: [],
        pageInfo: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it("should default page and limit when not provided in queryParams", async () => {
      mockFindCustomers.mockResolvedValue({
        rows: [],
        total: 0,
      });

      const result = await customerService.getCustomers(userData, {});

      expect(result.pageInfo.page).toBe(1);
      expect(result.pageInfo.limit).toBe(10);
    });

    it("should map customer rows to the API shape, including numeric shopifyCustomerId and shopifyLink", async () => {
      mockFindCustomers.mockResolvedValue({
        rows: [
          {
            id: 1,
            shopify_customer_id: "gid://shopify/Customer/555",
            first_name: "Jane",
            last_name: "Doe",
            email: "jane@test.com",
            phone: "+1234567890",
            orders_count: 3,
            total_spent: "150.00",
            state: "ENABLED",
            created_at_shopify: "2024-01-01T00:00:00.000Z",
            updated_at_shopify: "2024-01-02T00:00:00.000Z",
          },
        ],
        total: 1,
      });

      const result = await customerService.getCustomers(userData, {
        page: 1,
        limit: 10,
      });

      expect(result.customers).toHaveLength(1);
      expect(result.customers[0]).toEqual({
        id: 1,
        shopifyCustomerId: "555",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@test.com",
        phone: "+1234567890",
        ordersCount: 3,
        totalSpent: "150.00",
        state: "ENABLED",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
        shopifyLink: "https://demo.myshopify.com/admin/customers/555",
      });
    });

    it("should map multiple customers independently", async () => {
      mockFindCustomers.mockResolvedValue({
        rows: [
          {
            id: 1,
            shopify_customer_id: "gid://shopify/Customer/1",
            first_name: "Jane",
            last_name: "Doe",
            email: "jane@test.com",
            phone: null,
            orders_count: 1,
            total_spent: "10.00",
            state: "ENABLED",
            created_at_shopify: "2024-01-01T00:00:00.000Z",
            updated_at_shopify: "2024-01-01T00:00:00.000Z",
          },
          {
            id: 2,
            shopify_customer_id: "gid://shopify/Customer/2",
            first_name: "John",
            last_name: "Smith",
            email: "john@test.com",
            phone: null,
            orders_count: 5,
            total_spent: "500.00",
            state: "DISABLED",
            created_at_shopify: "2024-01-02T00:00:00.000Z",
            updated_at_shopify: "2024-01-02T00:00:00.000Z",
          },
        ],
        total: 2,
      });

      const result = await customerService.getCustomers(userData, {
        page: 1,
        limit: 10,
      });

      expect(result.customers).toHaveLength(2);
      expect(result.customers[0].shopifyCustomerId).toBe("1");
      expect(result.customers[0].shopifyLink).toBe(
        "https://demo.myshopify.com/admin/customers/1",
      );
      expect(result.customers[1].shopifyCustomerId).toBe("2");
      expect(result.customers[1].shopifyLink).toBe(
        "https://demo.myshopify.com/admin/customers/2",
      );
    });

    it("should compute totalPages, hasPreviousPage and hasNextPage correctly for a middle page", async () => {
      mockFindCustomers.mockResolvedValue({
        rows: [
          {
            id: 1,
            shopify_customer_id: "gid://shopify/Customer/1",
            first_name: "Jane",
            last_name: "Doe",
            email: "jane@test.com",
            phone: null,
            orders_count: 1,
            total_spent: "10.00",
            state: "ENABLED",
            created_at_shopify: "2024-01-01T00:00:00.000Z",
            updated_at_shopify: "2024-01-01T00:00:00.000Z",
          },
        ],
        total: 25,
      });

      const result = await customerService.getCustomers(userData, {
        page: 2,
        limit: 10,
      });

      expect(result.pageInfo).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasPreviousPage: true,
        hasNextPage: true,
      });
    });

    it("should set hasNextPage false on the last page", async () => {
      mockFindCustomers.mockResolvedValue({
        rows: [
          {
            id: 1,
            shopify_customer_id: "gid://shopify/Customer/1",
            first_name: "Jane",
            last_name: "Doe",
            email: "jane@test.com",
            phone: null,
            orders_count: 1,
            total_spent: "10.00",
            state: "ENABLED",
            created_at_shopify: "2024-01-01T00:00:00.000Z",
            updated_at_shopify: "2024-01-01T00:00:00.000Z",
          },
        ],
        total: 20,
      });

      const result = await customerService.getCustomers(userData, {
        page: 2,
        limit: 10,
      });

      expect(result.pageInfo.totalPages).toBe(2);
      expect(result.pageInfo.hasNextPage).toBe(false);
      expect(result.pageInfo.hasPreviousPage).toBe(true);
    });

    it("should set hasPreviousPage false on the first page", async () => {
      mockFindCustomers.mockResolvedValue({
        rows: [
          {
            id: 1,
            shopify_customer_id: "gid://shopify/Customer/1",
            first_name: "Jane",
            last_name: "Doe",
            email: "jane@test.com",
            phone: null,
            orders_count: 1,
            total_spent: "10.00",
            state: "ENABLED",
            created_at_shopify: "2024-01-01T00:00:00.000Z",
            updated_at_shopify: "2024-01-01T00:00:00.000Z",
          },
        ],
        total: 20,
      });

      const result = await customerService.getCustomers(userData, {
        page: 1,
        limit: 10,
      });

      expect(result.pageInfo.hasPreviousPage).toBe(false);
      expect(result.pageInfo.hasNextPage).toBe(true);
    });

    it("should coerce string page/limit query params to numbers", async () => {
      mockFindCustomers.mockResolvedValue({
        rows: [
          {
            id: 1,
            shopify_customer_id: "gid://shopify/Customer/1",
            first_name: "Jane",
            last_name: "Doe",
            email: "jane@test.com",
            phone: null,
            orders_count: 1,
            total_spent: "10.00",
            state: "ENABLED",
            created_at_shopify: "2024-01-01T00:00:00.000Z",
            updated_at_shopify: "2024-01-01T00:00:00.000Z",
          },
        ],
        total: 10,
      });

      const result = await customerService.getCustomers(userData, {
        page: "1",
        limit: "5",
      });

      expect(result.pageInfo.page).toBe(1);
      expect(result.pageInfo.limit).toBe(5);
      expect(result.pageInfo.totalPages).toBe(2);
    });

    it("should propagate errors from findCustomers", async () => {
      mockFindCustomers.mockRejectedValue(new Error("Database error"));

      await expect(
        customerService.getCustomers(userData, { page: 1, limit: 10 }),
      ).rejects.toThrow("Database error");
    });
  });
});