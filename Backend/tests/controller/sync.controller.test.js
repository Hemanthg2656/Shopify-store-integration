import { jest } from "@jest/globals";

const mockSyncProducts = jest.fn();
const mockSyncOrders = jest.fn();
const mockSyncCustomers = jest.fn();
const mockGetLatestSyncStatus = jest.fn();

jest.unstable_mockModule("../../src/service/productSync.services.js", () => ({
  syncProducts: mockSyncProducts,
}));

jest.unstable_mockModule("../../src/service/orderSync.services.js", () => ({
  syncOrders: mockSyncOrders,
}));

jest.unstable_mockModule("../../src/service/customerSync.services.js", () => ({
  syncCustomers: mockSyncCustomers,
}));

jest.unstable_mockModule("../../src/service/syncLog.services.js", () => ({
  getLatestSyncStatus: mockGetLatestSyncStatus,
}));

const syncController = await import("../../src/controller/sync.controller.js");

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("sync.controller", () => {
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNext = jest.fn();
  });

  describe("syncProducts", () => {
    it("should return the sync result on success", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();

      mockSyncProducts.mockResolvedValue({ synced: 10 });

      await syncController.syncProducts(req, res, mockNext);

      expect(mockSyncProducts).toHaveBeenCalledWith(req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Products synced successfully",
        data: { synced: 10 },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should forward errors to next()", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();
      const error = new Error("Sync failed");

      mockSyncProducts.mockRejectedValue(error);

      await syncController.syncProducts(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("syncOrders", () => {
    it("should return the sync result on success", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();

      mockSyncOrders.mockResolvedValue({ synced: 5 });

      await syncController.syncOrders(req, res, mockNext);

      expect(mockSyncOrders).toHaveBeenCalledWith(req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Orders synced successfully",
        data: { synced: 5 },
      });
    });

    it("should forward errors to next()", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();
      const error = new Error("Sync failed");

      mockSyncOrders.mockRejectedValue(error);

      await syncController.syncOrders(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("syncCustomers", () => {
    it("should return the sync result on success", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();

      mockSyncCustomers.mockResolvedValue({ synced: 8 });

      await syncController.syncCustomers(req, res, mockNext);

      expect(mockSyncCustomers).toHaveBeenCalledWith(req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Customers synced successfully",
        data: { synced: 8 },
      });
    });

    it("should forward errors to next()", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();
      const error = new Error("Sync failed");

      mockSyncCustomers.mockRejectedValue(error);

      await syncController.syncCustomers(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getSyncStatus", () => {
    it("should bucket log entries into products/orders/customers by resource_type", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();

      mockGetLatestSyncStatus.mockResolvedValue([
        { resource_type: "PRODUCTS", status: "SUCCESS" },
        { resource_type: "ORDERS", status: "FAILED" },
        { resource_type: "CUSTOMERS", status: "RUNNING" },
      ]);

      await syncController.getSyncStatus(req, res, mockNext);

      expect(mockGetLatestSyncStatus).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        syncStatus: {
          products: { resource_type: "PRODUCTS", status: "SUCCESS" },
          orders: { resource_type: "ORDERS", status: "FAILED" },
          customers: { resource_type: "CUSTOMERS", status: "RUNNING" },
        },
      });
    });

    it("should leave a resource null when no log exists for it", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();

      mockGetLatestSyncStatus.mockResolvedValue([
        { resource_type: "PRODUCTS", status: "SUCCESS" },
      ]);

      await syncController.getSyncStatus(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        syncStatus: {
          products: { resource_type: "PRODUCTS", status: "SUCCESS" },
          orders: null,
          customers: null,
        },
      });
    });

    it("should ignore an unrecognized resource_type", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();

      mockGetLatestSyncStatus.mockResolvedValue([
        { resource_type: "UNKNOWN", status: "SUCCESS" },
      ]);

      await syncController.getSyncStatus(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        syncStatus: { products: null, orders: null, customers: null },
      });
    });

    it("should forward errors to next()", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();
      const error = new Error("Database error");

      mockGetLatestSyncStatus.mockRejectedValue(error);

      await syncController.getSyncStatus(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});