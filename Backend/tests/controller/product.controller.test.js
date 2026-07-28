import { jest } from "@jest/globals";

const mockGetProducts = jest.fn();
const mockGetProductTypes = jest.fn();
const mockGetProductShopifyLink = jest.fn();

jest.unstable_mockModule("../../src/service/product.services.js", () => ({
  getProducts: mockGetProducts,
  getProductTypes: mockGetProductTypes,
  getProductShopifyLink: mockGetProductShopifyLink,
}));

const mockLoggerError = jest.fn();

jest.unstable_mockModule("../../src/utils/logger.js", () => ({
  default: { error: mockLoggerError },
}));

const productController = await import("../../src/controller/product.controller.js");

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("product.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProducts", () => {
    it("should return products with count and pageInfo on success", async () => {
      const req = { user: { storeId: 1 }, validatedQuery: { page: 1, limit: 10 } };
      const res = createMockRes();

      mockGetProducts.mockResolvedValue({
        products: [{ id: 1 }, { id: 2 }],
        pageInfo: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });

      await productController.getProducts(req, res);

      expect(mockGetProducts).toHaveBeenCalledWith(req.user, req.validatedQuery);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Products fetched successfully",
        count: 2,
        pageInfo: { page: 1, limit: 10, total: 2, totalPages: 1 },
        products: [{ id: 1 }, { id: 2 }],
      });
    });

    it("should log and return the error's statusCode when provided", async () => {
      const req = { user: { storeId: 1 }, validatedQuery: {} };
      const res = createMockRes();

      const error = new Error("Invalid query");
      error.statusCode = 400;
      mockGetProducts.mockRejectedValue(error);

      await productController.getProducts(req, res);

      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.objectContaining({ err: error, storeId: 1 }),
        "Failed to fetch products",
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid query",
      });
    });

    it("should default to 500 and a generic message when the error has neither", async () => {
      const req = { user: { storeId: 1 }, validatedQuery: {} };
      const res = createMockRes();

      mockGetProducts.mockRejectedValue(new Error());

      await productController.getProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error",
      });
    });
  });

  describe("getProductTypes", () => {
    it("should return product types with count on success", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();

      mockGetProductTypes.mockResolvedValue(["Apparel", "Home"]);

      await productController.getProductTypes(req, res);

      expect(mockGetProductTypes).toHaveBeenCalledWith(req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Product types fetched successfully",
        count: 2,
        productTypes: ["Apparel", "Home"],
      });
    });

    it("should log and return the error's statusCode when provided", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();

      const error = new Error("Access token not found");
      error.statusCode = 404;
      mockGetProductTypes.mockRejectedValue(error);

      await productController.getProductTypes(req, res);

      expect(mockLoggerError).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Access token not found",
      });
    });

    it("should default to 500 when the error has no statusCode", async () => {
      const req = { user: { storeId: 1 } };
      const res = createMockRes();

      mockGetProductTypes.mockRejectedValue(new Error());

      await productController.getProductTypes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error",
      });
    });
  });

  describe("getProductShopifyLink", () => {
    it("should return 400 when productId param is missing", async () => {
      const req = { user: { storeId: 1 }, params: {} };
      const res = createMockRes();

      await productController.getProductShopifyLink(req, res);

      expect(mockGetProductShopifyLink).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Product id is required",
      });
    });

    it("should return the Shopify link on success", async () => {
      const req = { user: { storeId: 1 }, params: { productId: "gid://shopify/Product/1" } };
      const res = createMockRes();

      mockGetProductShopifyLink.mockResolvedValue(
        "https://demo.myshopify.com/admin/products/1",
      );

      await productController.getProductShopifyLink(req, res);

      expect(mockGetProductShopifyLink).toHaveBeenCalledWith(
        req.user,
        "gid://shopify/Product/1",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Product shopifyUrl fetched successfully",
        shopifyUrl: "https://demo.myshopify.com/admin/products/1",
      });
    });

    it("should log and return the error's statusCode when the service throws one", async () => {
      const req = { user: { storeId: 1 }, params: { productId: "bad-id" } };
      const res = createMockRes();

      const error = new Error("Invalid product id");
      error.statusCode = 422;
      mockGetProductShopifyLink.mockRejectedValue(error);

      await productController.getProductShopifyLink(req, res);

      expect(mockLoggerError).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid product id",
      });
    });

    it("should default to 500 when the thrown error has no statusCode", async () => {
      const req = { user: { storeId: 1 }, params: { productId: "1" } };
      const res = createMockRes();

      mockGetProductShopifyLink.mockRejectedValue(new Error());

      await productController.getProductShopifyLink(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server Error",
      });
    });
  });
});