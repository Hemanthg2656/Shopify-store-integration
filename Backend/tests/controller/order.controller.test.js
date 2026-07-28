import { jest } from "@jest/globals";

const mockGetOrders = jest.fn();
const mockGetOrderShopifyLink = jest.fn();

jest.unstable_mockModule("../../src/service/order.services.js", () => ({
  getOrders: mockGetOrders,
  getOrderShopifyLink: mockGetOrderShopifyLink,
}));

const mockLoggerError = jest.fn();

jest.unstable_mockModule("../../src/utils/logger.js", () => ({
  default: { error: mockLoggerError },
}));

const orderController = await import("../../src/controller/order.controller.js");

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("order.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOrders", () => {
    it("should return orders with count and pageInfo on success", async () => {
      const req = { user: { storeId: 1 }, validatedQuery: { page: 1, limit: 10 } };
      const res = createMockRes();

      mockGetOrders.mockResolvedValue({
        orders: [{ id: 1 }],
        pageInfo: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      await orderController.getOrders(req, res);

      expect(mockGetOrders).toHaveBeenCalledWith(req.user, req.validatedQuery);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Orders fetched successfully",
        count: 1,
        pageInfo: { page: 1, limit: 10, total: 1, totalPages: 1 },
        orders: [{ id: 1 }],
      });
    });

    it("should log and return the error's statusCode when provided", async () => {
      const req = { user: { storeId: 1 }, validatedQuery: {} };
      const res = createMockRes();

      const error = new Error("Bad request");
      error.statusCode = 400;
      mockGetOrders.mockRejectedValue(error);

      await orderController.getOrders(req, res);

      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.objectContaining({ err: error, storeId: 1 }),
        "Failed to fetch orders",
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Bad request",
      });
    });

    it("should default to 500 and a generic message when the error has neither", async () => {
      const req = { user: { storeId: 1 }, validatedQuery: {} };
      const res = createMockRes();

      mockGetOrders.mockRejectedValue(new Error());

      await orderController.getOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server Error",
      });
    });
  });

  describe("getOrderShopifyLink", () => {
    it("should return the Shopify link on success", async () => {
      const req = { user: { storeId: 1 }, params: { orderId: "gid://shopify/Order/1" } };
      const res = createMockRes();

      mockGetOrderShopifyLink.mockResolvedValue(
        "https://demo.myshopify.com/admin/orders/1",
      );

      await orderController.getOrderShopifyLink(req, res);

      expect(mockGetOrderShopifyLink).toHaveBeenCalledWith(
        req.user,
        "gid://shopify/Order/1",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        shopifyUrl: "https://demo.myshopify.com/admin/orders/1",
      });
    });

    it("should log and return the error's statusCode when provided", async () => {
      const req = { user: { storeId: 1 }, params: { orderId: "1" } };
      const res = createMockRes();

      const error = new Error("Order not found");
      error.statusCode = 404;
      mockGetOrderShopifyLink.mockRejectedValue(error);

      await orderController.getOrderShopifyLink(req, res);

      expect(mockLoggerError).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Order not found",
      });
    });

    it("should default to 500 when the thrown error has no statusCode", async () => {
      const req = { user: { storeId: 1 }, params: { orderId: "1" } };
      const res = createMockRes();

      mockGetOrderShopifyLink.mockRejectedValue(new Error("Unexpected"));

      await orderController.getOrderShopifyLink(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unexpected",
      });
    });
  });
});