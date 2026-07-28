import { jest } from "@jest/globals";

const mockGetStoreDetails = jest.fn();

jest.unstable_mockModule("../../src/service/store.services.js", () => ({
  getStoreDetails: mockGetStoreDetails,
}));

const mockLoggerError = jest.fn();

jest.unstable_mockModule("../../src/utils/logger.js", () => ({
  default: { error: mockLoggerError },
}));

const storeController = await import("../../src/controller/store.controller.js");

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("store.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getStoreDetails", () => {
    it("should return store details on success", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();

      mockGetStoreDetails.mockResolvedValue({
        id: 1,
        storeDomain: "demo.myshopify.com",
      });

      await storeController.getStoreDetails(req, res);

      expect(mockGetStoreDetails).toHaveBeenCalledWith(req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Store fetched successfully",
        store: { id: 1, storeDomain: "demo.myshopify.com" },
      });
    });

    it("should log and return the error's statusCode when provided", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();

      const error = new Error("Store not found");
      error.statusCode = 404;
      mockGetStoreDetails.mockRejectedValue(error);

      await storeController.getStoreDetails(req, res);

      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.objectContaining({ err: error, storeId: 1 }),
        "Failed to fetch store",
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Store not found",
      });
    });

    it("should default to 500 and a generic message when the error has neither", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();

      mockGetStoreDetails.mockRejectedValue(new Error());

      await storeController.getStoreDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server Error",
      });
    });
  });
});