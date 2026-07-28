import { jest } from "@jest/globals";

// ---------- MOCKS ----------

const mockFindOrders = jest.fn();

jest.unstable_mockModule("../../src/repositories/order.repository.js", () => ({
  findOrders: mockFindOrders,
}));

// ---------- IMPORT SERVICE AFTER MOCKS ----------

const orderService = await import("../../src/service/order.services.js");

describe("order.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOrderShopifyLink", () => {
    it("should build the Shopify admin link from a numeric-suffixed gid", () => {
      const userData = { shop: "demo.myshopify.com" };
      const link = orderService.getOrderShopifyLink(
        userData,
        "gid://shopify/Order/123",
      );

      expect(link).toBe("https://demo.myshopify.com/admin/orders/123");
    });

    it("should just append a plain id if no slashes are present", () => {
      const userData = { shop: "demo.myshopify.com" };
      const link = orderService.getOrderShopifyLink(userData, "123");

      expect(link).toBe("https://demo.myshopify.com/admin/orders/123");
    });
  });

  describe("getOrders", () => {
    const userData = { storeId: 1, shop: "demo.myshopify.com" };

    it("should return an empty orders array and zeroed pageInfo when no rows found", async () => {
      mockFindOrders.mockResolvedValue({
        rows: [],
        total: 0,
      });

      const result = await orderService.getOrders(userData, {
        page: 1,
        limit: 10,
      });

      expect(mockFindOrders).toHaveBeenCalledWith(1, { page: 1, limit: 10 });

      expect(result).toEqual({
        orders: [],
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
      mockFindOrders.mockResolvedValue({
        rows: [],
        total: 0,
      });

      const result = await orderService.getOrders(userData, {});

      expect(result.pageInfo.page).toBe(1);
      expect(result.pageInfo.limit).toBe(10);
    });

    it("should map order rows to the API shape, including the generated shopifyLink", async () => {
      mockFindOrders.mockResolvedValue({
        rows: [
          {
            id: 1,
            shopify_order_id: "gid://shopify/Order/555",
            order_number: "#1001",
            customer_name: "Jane Doe",
            customer_email: "jane@test.com",
            financial_status: "PAID",
            fulfillment_status: "FULFILLED",
            currency: "USD",
            total_price: "49.99",
            created_at_shopify: "2024-01-01T00:00:00.000Z",
            updated_at_shopify: "2024-01-02T00:00:00.000Z",
          },
        ],
        total: 1,
      });

      const result = await orderService.getOrders(userData, {
        page: 1,
        limit: 10,
      });

      expect(result.orders).toHaveLength(1);
      expect(result.orders[0]).toEqual({
        id: 1,
        shopifyOrderId: "gid://shopify/Order/555",
        orderNumber: "#1001",
        shopifyLink: "https://demo.myshopify.com/admin/orders/555",
        customerName: "Jane Doe",
        customerEmail: "jane@test.com",
        financialStatus: "PAID",
        fulfillmentStatus: "FULFILLED",
        currency: "USD",
        totalAmount: "49.99",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      });
    });

    it("should map multiple orders independently", async () => {
      mockFindOrders.mockResolvedValue({
        rows: [
          {
            id: 1,
            shopify_order_id: "gid://shopify/Order/1",
            order_number: "#1001",
            customer_name: "Jane",
            customer_email: "jane@test.com",
            financial_status: "PAID",
            fulfillment_status: "FULFILLED",
            currency: "USD",
            total_price: "10.00",
            created_at_shopify: "2024-01-01T00:00:00.000Z",
            updated_at_shopify: "2024-01-01T00:00:00.000Z",
          },
          {
            id: 2,
            shopify_order_id: "gid://shopify/Order/2",
            order_number: "#1002",
            customer_name: "John",
            customer_email: "john@test.com",
            financial_status: "PENDING",
            fulfillment_status: "UNFULFILLED",
            currency: "USD",
            total_price: "20.00",
            created_at_shopify: "2024-01-02T00:00:00.000Z",
            updated_at_shopify: "2024-01-02T00:00:00.000Z",
          },
        ],
        total: 2,
      });

      const result = await orderService.getOrders(userData, {
        page: 1,
        limit: 10,
      });

      expect(result.orders).toHaveLength(2);
      expect(result.orders[0].shopifyLink).toBe(
        "https://demo.myshopify.com/admin/orders/1",
      );
      expect(result.orders[1].shopifyLink).toBe(
        "https://demo.myshopify.com/admin/orders/2",
      );
    });

    it("should compute totalPages, hasPreviousPage and hasNextPage correctly for a middle page", async () => {
      mockFindOrders.mockResolvedValue({
        rows: [
          {
            id: 1,
            shopify_order_id: "gid://shopify/Order/1",
            order_number: "#1001",
            customer_name: "Jane",
            customer_email: "jane@test.com",
            financial_status: "PAID",
            fulfillment_status: "FULFILLED",
            currency: "USD",
            total_price: "10.00",
            created_at_shopify: "2024-01-01T00:00:00.000Z",
            updated_at_shopify: "2024-01-01T00:00:00.000Z",
          },
        ],
        total: 25,
      });

      const result = await orderService.getOrders(userData, {
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
      mockFindOrders.mockResolvedValue({
        rows: [
          {
            id: 1,
            shopify_order_id: "gid://shopify/Order/1",
            order_number: "#1001",
            customer_name: "Jane",
            customer_email: "jane@test.com",
            financial_status: "PAID",
            fulfillment_status: "FULFILLED",
            currency: "USD",
            total_price: "10.00",
            created_at_shopify: "2024-01-01T00:00:00.000Z",
            updated_at_shopify: "2024-01-01T00:00:00.000Z",
          },
        ],
        total: 20,
      });

      const result = await orderService.getOrders(userData, {
        page: 2,
        limit: 10,
      });

      expect(result.pageInfo.totalPages).toBe(2);
      expect(result.pageInfo.hasNextPage).toBe(false);
      expect(result.pageInfo.hasPreviousPage).toBe(true);
    });

    it("should set hasPreviousPage false on the first page", async () => {
      mockFindOrders.mockResolvedValue({
        rows: [
          {
            id: 1,
            shopify_order_id: "gid://shopify/Order/1",
            order_number: "#1001",
            customer_name: "Jane",
            customer_email: "jane@test.com",
            financial_status: "PAID",
            fulfillment_status: "FULFILLED",
            currency: "USD",
            total_price: "10.00",
            created_at_shopify: "2024-01-01T00:00:00.000Z",
            updated_at_shopify: "2024-01-01T00:00:00.000Z",
          },
        ],
        total: 20,
      });

      const result = await orderService.getOrders(userData, {
        page: 1,
        limit: 10,
      });

      expect(result.pageInfo.hasPreviousPage).toBe(false);
      expect(result.pageInfo.hasNextPage).toBe(true);
    });

    it("should coerce string page/limit query params to numbers", async () => {
      mockFindOrders.mockResolvedValue({
        rows: [
          {
            id: 1,
            shopify_order_id: "gid://shopify/Order/1",
            order_number: "#1001",
            customer_name: "Jane",
            customer_email: "jane@test.com",
            financial_status: "PAID",
            fulfillment_status: "FULFILLED",
            currency: "USD",
            total_price: "10.00",
            created_at_shopify: "2024-01-01T00:00:00.000Z",
            updated_at_shopify: "2024-01-01T00:00:00.000Z",
          },
        ],
        total: 10,
      });

      const result = await orderService.getOrders(userData, {
        page: "1",
        limit: "5",
      });

      expect(result.pageInfo.page).toBe(1);
      expect(result.pageInfo.limit).toBe(5);
      expect(result.pageInfo.totalPages).toBe(2);
    });

    it("should propagate errors from findOrders", async () => {
      mockFindOrders.mockRejectedValue(new Error("Database error"));

      await expect(
        orderService.getOrders(userData, { page: 1, limit: 10 }),
      ).rejects.toThrow("Database error");
    });
  });
});