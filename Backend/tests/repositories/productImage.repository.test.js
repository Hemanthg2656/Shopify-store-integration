import { jest } from "@jest/globals";

const mockQuery = jest.fn();

jest.unstable_mockModule("../../src/config/db.js", () => ({
  default: { query: mockQuery },
}));

const productImageRepository = await import(
  "../../src/repositories/productImage.repository.js"
);

describe("productImage.repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("upsertProductImage", () => {
    it("should insert/upsert an image with all fields in order", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

      const image = {
        productId: 1,
        shopifyImageId: "gid://shopify/ProductImage/1",
        imageUrl: "https://cdn.shopify.com/img1.png",
        altText: "Front view",
        position: 1,
        width: 800,
        height: 600,
      };

      await productImageRepository.upsertProductImage(image);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("ON CONFLICT (product_id, shopify_image_id)"),
        [1, "gid://shopify/ProductImage/1", "https://cdn.shopify.com/img1.png", "Front view", 1, 800, 600],
      );
    });
  });

  describe("findImagesByProductId", () => {
    it("should query images for a single product ordered by position", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1, product_id: 1 }] });

      const result = await productImageRepository.findImagesByProductId(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY position ASC"),
        [1],
      );
      expect(result.rows[0].product_id).toBe(1);
    });
  });

  describe("deleteImagesByProductId", () => {
    it("should delete images for a product", async () => {
      mockQuery.mockResolvedValue({ rowCount: 3 });

      const result = await productImageRepository.deleteImagesByProductId(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("DELETE"),
        [1],
      );
      expect(result.rowCount).toBe(3);
    });
  });

  describe("findImagesByProductIds", () => {
    it("should query images across multiple product ids using ANY(...)", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          { id: 1, product_id: 1 },
          { id: 2, product_id: 2 },
        ],
      });

      const result = await productImageRepository.findImagesByProductIds([1, 2]);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("product_id = ANY($1::int[])"),
        [[1, 2]],
      );
      expect(result.rows).toHaveLength(2);
    });

    it("should propagate database errors", async () => {
      mockQuery.mockRejectedValue(new Error("Database error"));

      await expect(
        productImageRepository.findImagesByProductIds([1]),
      ).rejects.toThrow("Database error");
    });
  });
});