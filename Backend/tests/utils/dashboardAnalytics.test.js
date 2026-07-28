import {
  buildMonthlyRevenue,
  buildMonthlyOrders,
  buildOrderSummary,
  buildProductStatus,
} from "../../src/utils/dashboardAnalytics.js";

const makeOrderNode = ({
  createdAt,
  amount,
  financialStatus = "PAID",
  fulfillmentStatus = "FULFILLED",
}) => ({
  node: {
    createdAt,
    currentTotalPriceSet: { shopMoney: { amount: String(amount) } },
    displayFinancialStatus: financialStatus,
    displayFulfillmentStatus: fulfillmentStatus,
  },
});

const makeProductNode = (status) => ({ node: { status } });

describe("dashboardAnalytics", () => {
  describe("buildMonthlyRevenue", () => {
    it("should return an empty array for no orders", () => {
      expect(buildMonthlyRevenue([])).toEqual([]);
    });

    it("should sum revenue for orders within the same month", () => {
      const orders = [
        makeOrderNode({ createdAt: "2024-01-05T00:00:00.000Z", amount: 100 }),
        makeOrderNode({ createdAt: "2024-01-20T00:00:00.000Z", amount: 50.5 }),
      ];

      const result = buildMonthlyRevenue(orders);

      expect(result).toEqual([{ month: "Jan", revenue: 150.5 }]);
    });

    it("should split revenue across separate months", () => {
      const orders = [
        makeOrderNode({ createdAt: "2024-01-05T00:00:00.000Z", amount: 100 }),
        makeOrderNode({ createdAt: "2024-02-05T00:00:00.000Z", amount: 200 }),
      ];

      const result = buildMonthlyRevenue(orders);

      expect(result).toEqual([
        { month: "Jan", revenue: 100 },
        { month: "Feb", revenue: 200 },
      ]);
    });

    it("should round revenue to 2 decimal places", () => {
      const orders = [
        makeOrderNode({ createdAt: "2024-01-05T00:00:00.000Z", amount: 10.005 }),
        makeOrderNode({ createdAt: "2024-01-06T00:00:00.000Z", amount: 10.005 }),
      ];

      const result = buildMonthlyRevenue(orders);

      expect(result[0].revenue).toBe(20.01);
    });
  });

  describe("buildMonthlyOrders", () => {
    it("should return an empty array for no orders", () => {
      expect(buildMonthlyOrders([])).toEqual([]);
    });

    it("should count orders per month", () => {
      const orders = [
        makeOrderNode({ createdAt: "2024-01-05T00:00:00.000Z", amount: 10 }),
        makeOrderNode({ createdAt: "2024-01-20T00:00:00.000Z", amount: 20 }),
        makeOrderNode({ createdAt: "2024-02-01T00:00:00.000Z", amount: 30 }),
      ];

      const result = buildMonthlyOrders(orders);

      expect(result).toEqual([
        { month: "Jan", orders: 2 },
        { month: "Feb", orders: 1 },
      ]);
    });
  });

  describe("buildOrderSummary", () => {
    it("should return zeroed values for no orders", () => {
      const result = buildOrderSummary([]);

      expect(result).toEqual({
        averageOrderValue: 0,
        totalRevenue: 0,
        paidOrders: 0,
        pendingOrders: 0,
        fulfilledOrders: 0,
        unfulfilledOrders: 0,
      });
    });

    it("should compute totals, average, and status counts across orders", () => {
      const orders = [
        makeOrderNode({
          createdAt: "2024-01-01",
          amount: 100,
          financialStatus: "PAID",
          fulfillmentStatus: "FULFILLED",
        }),
        makeOrderNode({
          createdAt: "2024-01-02",
          amount: 50,
          financialStatus: "PENDING",
          fulfillmentStatus: "UNFULFILLED",
        }),
      ];

      const result = buildOrderSummary(orders);

      expect(result).toEqual({
        averageOrderValue: 75,
        totalRevenue: 150,
        paidOrders: 1,
        pendingOrders: 1,
        fulfilledOrders: 1,
        unfulfilledOrders: 1,
      });
    });

    it("should not increment paid/pending or fulfilled/unfulfilled counters for unrecognized statuses", () => {
      const orders = [
        makeOrderNode({
          createdAt: "2024-01-01",
          amount: 100,
          financialStatus: "REFUNDED",
          fulfillmentStatus: "PARTIAL",
        }),
      ];

      const result = buildOrderSummary(orders);

      expect(result.paidOrders).toBe(0);
      expect(result.pendingOrders).toBe(0);
      expect(result.fulfilledOrders).toBe(0);
      expect(result.unfulfilledOrders).toBe(0);
      expect(result.totalRevenue).toBe(100);
    });

    it("should round totalRevenue and averageOrderValue to 2 decimal places", () => {
      const orders = [
        makeOrderNode({ createdAt: "2024-01-01", amount: 10.005 }),
        makeOrderNode({ createdAt: "2024-01-02", amount: 10.004 }),
        makeOrderNode({ createdAt: "2024-01-03", amount: 10.003 }),
      ];

      const result = buildOrderSummary(orders);

      expect(result.totalRevenue).toBe(30.01);
    });
  });

  describe("buildProductStatus", () => {
    it("should return zeroed counts for no products", () => {
      expect(buildProductStatus([])).toEqual({
        active: 0,
        draft: 0,
        archived: 0,
      });
    });

    it("should count products by status", () => {
      const products = [
        makeProductNode("ACTIVE"),
        makeProductNode("ACTIVE"),
        makeProductNode("DRAFT"),
        makeProductNode("ARCHIVED"),
      ];

      const result = buildProductStatus(products);

      expect(result).toEqual({ active: 2, draft: 1, archived: 1 });
    });

    it("should ignore products with an unrecognized status", () => {
      const products = [makeProductNode("UNKNOWN_STATUS")];

      const result = buildProductStatus(products);

      expect(result).toEqual({ active: 0, draft: 0, archived: 0 });
    });
  });
});