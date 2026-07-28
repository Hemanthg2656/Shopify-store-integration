import { jest } from "@jest/globals";

const mockGetCustomers = jest.fn();

jest.unstable_mockModule("../../src/service/customer.services.js", () => ({
  getCustomers: mockGetCustomers,
}));

const mockLoggerError = jest.fn();

jest.unstable_mockModule("../../src/utils/logger.js", () => ({
  default: { error: mockLoggerError },
}));

const customerController = await import("../../src/controller/customer.controller.js");

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("customer.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCustomers", () => {
    it("should return customers with count and pageInfo on success", async () => {
      const req = { user: { storeId: 1 }, validatedQuery: { page: 1, limit: 10 } };
      const res = createMockRes();

      mockGetCustomers.mockResolvedValue({
        customers: [{ id: 1 }, { id: 2 }, { id: 3 }],
        pageInfo: { page: 1, limit: 10, total: 3, totalPages: 1 },
      });

      await customerController.getCustomers(req, res);

      expect(mockGetCustomers).toHaveBeenCalledWith(req.user, req.validatedQuery);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Customers fetched successfully",
        count: 3,
        pageInfo: { page: 1, limit: 10, total: 3, totalPages: 1 },
        customers: [{ id: 1 }, { id: 2 }, { id: 3 }],
      });
    });

    it("should log and return the error's statusCode when provided", async () => {
      const req = { user: { storeId: 1 }, validatedQuery: {} };
      const res = createMockRes();

      const error = new Error("Bad request");
      error.statusCode = 400;
      mockGetCustomers.mockRejectedValue(error);

      await customerController.getCustomers(req, res);

      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.objectContaining({ err: error, storeId: 1 }),
        "Failed to fetch customers",
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

      mockGetCustomers.mockRejectedValue(new Error());

      await customerController.getCustomers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server Error",
      });
    });
  });
});