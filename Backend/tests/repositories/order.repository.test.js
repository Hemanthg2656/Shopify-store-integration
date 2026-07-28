import { jest } from "@jest/globals";

const mockQuery = jest.fn();

jest.unstable_mockModule("../../src/config/db.js", () => ({
  default: { query: mockQuery },
}));

const orderRepository =
  await import("../../src/repositories/order.repository.js");

describe("order.repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("upsertOrder", () => {
    it("should insert/upsert an order with all fields in order", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

      const order = {
        storeId: 1,
        shopifyOrderId: "gid://shopify/Order/1",
        orderNumber: "#1001",
        customerName: "Jane Doe",
        customerEmail: "jane@test.com",
        financialStatus: "PAID",
        fulfillmentStatus: "FULFILLED",
        currency: "USD",
        totalPrice: "49.99",
        createdAtShopify: "2024-01-01",
        updatedAtShopify: "2024-01-02",
      };

      await orderRepository.upsertOrder(order);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("ON CONFLICT (store_id, shopify_order_id)"),
        [
          1,
          "gid://shopify/Order/1",
          "#1001",
          "Jane Doe",
          "jane@test.com",
          "PAID",
          "FULFILLED",
          "USD",
          "49.99",
          "2024-01-01",
          "2024-01-02",
        ],
      );
    });
  });

  describe("findOrders", () => {
    it("should query with only the base store filter when no optional params given", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await orderRepository.findOrders(1, {});

      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("WHERE store_id = $1"),
        [1],
      );
      expect(result).toEqual({ rows: [], total: 0 });
    });

    it("should add a search filter across order number, name, and email", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "1" }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await orderRepository.findOrders(1, { search: "jane" });

      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("customer_email ILIKE $2"),
        [1, "%jane%"],
      );
    });

    it("should combine financialStatus, fulfillmentStatus, dateFrom, and dateTo filters", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "1" }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await orderRepository.findOrders(1, {
        financialStatus: "PAID",
        fulfillmentStatus: "FULFILLED",
        dateFrom: "2024-01-01",
        dateTo: "2024-01-31",
      });

      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("DATE(created_at_shopify) <= $5"),
        [1, "PAID", "FULFILLED", "2024-01-01", "2024-01-31"],
      );
    });

    it("should sort by price when sort=price", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      await orderRepository.findOrders(1, { sort: "price" });

      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("ORDER BY total_price DESC"),
        expect.any(Array),
      );
    });

    it("should sort by order number when sort=order", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      await orderRepository.findOrders(1, { sort: "order" });

      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("ORDER BY order_number ASC"),
        expect.any(Array),
      );
    });

    it("should sort oldest first when sort=oldest", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      await orderRepository.findOrders(1, { sort: "oldest" });

      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("ORDER BY created_at_shopify ASC"),
        expect.any(Array),
      );
    });

    it("should default to newest-first sort for an unrecognized sort value", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      await orderRepository.findOrders(1, { sort: "bogus" });

      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("ORDER BY created_at_shopify DESC"),
        expect.any(Array),
      );
    });

    it("should compute the correct offset for a given page and limit", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "50" }] })
        .mockResolvedValueOnce({ rows: [] });

      await orderRepository.findOrders(1, { page: 3, limit: 20 });

      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        [1, 20, 40],
      );
    });

    it("should propagate database errors", async () => {
      mockQuery.mockRejectedValue(new Error("Database error"));

      await expect(orderRepository.findOrders(1, {})).rejects.toThrow(
        "Database error",
      );
    });
    it("should default queryParams to an empty object when omitted", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await orderRepository.findOrders(1);

      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("WHERE store_id = $1"),
        [1],
      );
      expect(result).toEqual({ rows: [], total: 0 });
    });
  });

  describe("findOrderByShopifyId", () => {
    it("should query an order by store id and shopify order id", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await orderRepository.findOrderByShopifyId(
        1,
        "gid://shopify/Order/1",
      );

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("AND shopify_order_id = $2"),
        [1, "gid://shopify/Order/1"],
      );
      expect(result.rows[0].id).toBe(1);
    });
  });

  describe("deleteOrdersByStore", () => {
    it("should delete all orders for a store", async () => {
      mockQuery.mockResolvedValue({ rowCount: 5 });

      const result = await orderRepository.deleteOrdersByStore(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM orders"),
        [1],
      );
      expect(result.rowCount).toBe(5);
    });
  });

  describe("getTotalRevenue", () => {
    it("should return the summed total revenue as a number", async () => {
      mockQuery.mockResolvedValue({ rows: [{ total_revenue: "1234.50" }] });

      const result = await orderRepository.getTotalRevenue(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("COALESCE(SUM(total_price), 0)"),
        [1],
      );
      expect(result).toBe(1234.5);
    });

    it("should return 0 when there are no orders for the store", async () => {
      mockQuery.mockResolvedValue({ rows: [{ total_revenue: "0" }] });

      const result = await orderRepository.getTotalRevenue(1);

      expect(result).toBe(0);
    });
  });
});
