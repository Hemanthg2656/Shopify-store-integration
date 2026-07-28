import { jest } from "@jest/globals";

const mockQuery = jest.fn();

jest.unstable_mockModule("../../src/config/db.js", () => ({
  default: { query: mockQuery },
}));

const productRepository =
  await import("../../src/repositories/product.repository.js");

describe("product.repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("upsertProduct", () => {
    it("should insert/upsert a product with all fields in order", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

      const product = {
        storeId: 1,
        shopifyProductId: "gid://shopify/Product/1",
        title: "T-Shirt",
        description: "A shirt",
        status: "ACTIVE",
        productType: "Apparel",
        vendor: "Acme",
        price: "19.99",
        totalInventory: 50,
        createdAtShopify: "2024-01-01",
        updatedAtShopify: "2024-01-02",
      };

      await productRepository.upsertProduct(product);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("ON CONFLICT (store_id, shopify_product_id)"),
        [
          1,
          "gid://shopify/Product/1",
          "T-Shirt",
          "A shirt",
          "ACTIVE",
          "Apparel",
          "Acme",
          "19.99",
          50,
          "2024-01-01",
          "2024-01-02",
        ],
      );
    });
  });

  describe("findProducts", () => {
    it("should query with only the base store filter when no optional params given", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await productRepository.findProducts(1, {});

      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("WHERE store_id = $1"),
        [1],
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("LIMIT $2"),
        [1, 10, 0],
      );
      expect(result).toEqual({ rows: [], total: 0 });
    });

    it("should add a search filter and pass the wildcarded term", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "1" }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, title: "T-Shirt" }] });

      await productRepository.findProducts(1, { search: "shirt" });

      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("title ILIKE $2"),
        [1, "%shirt%"],
      );
    });

    it("should uppercase the status filter", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "1" }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await productRepository.findProducts(1, { status: "active" });

      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("status = $2"),
        [1, "ACTIVE"],
      );
    });

    it("should combine search, status, and productType filters with incrementing placeholders", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "1" }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await productRepository.findProducts(1, {
        search: "shirt",
        status: "active",
        productType: "Apparel",
      });

      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("product_type = $4"),
        [1, "%shirt%", "ACTIVE", "Apparel"],
      );
    });

    it("should sort oldest first when sort=oldest", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      await productRepository.findProducts(1, { sort: "oldest" });

      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("ORDER BY created_at_shopify ASC"),
        expect.any(Array),
      );
    });

    it("should sort by title when sort=title", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      await productRepository.findProducts(1, { sort: "title" });

      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("ORDER BY title ASC"),
        expect.any(Array),
      );
    });

    it("should default to newest-first sort for an unrecognized sort value", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      await productRepository.findProducts(1, { sort: "bogus" });

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

      await productRepository.findProducts(1, { page: 3, limit: 20 });

      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        [1, 20, 40],
      );
    });

    it("should propagate database errors", async () => {
      mockQuery.mockRejectedValue(new Error("Database error"));

      await expect(productRepository.findProducts(1, {})).rejects.toThrow(
        "Database error",
      );
    });
    it("should default queryParams to an empty object when omitted", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await productRepository.findProducts(1);

      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("WHERE store_id = $1"),
        [1],
      );
      expect(result).toEqual({ rows: [], total: 0 });
    });
  });

  describe("findProductByShopifyId", () => {
    it("should query a product by store id and shopify product id", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await productRepository.findProductByShopifyId(
        1,
        "gid://shopify/Product/1",
      );

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("AND shopify_product_id = $2"),
        [1, "gid://shopify/Product/1"],
      );
      expect(result.rows[0].id).toBe(1);
    });
  });

  describe("deleteProductsByStore", () => {
    it("should delete all products for a store", async () => {
      mockQuery.mockResolvedValue({ rowCount: 10 });

      const result = await productRepository.deleteProductsByStore(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM products"),
        [1],
      );
      expect(result.rowCount).toBe(10);
    });
  });
});
