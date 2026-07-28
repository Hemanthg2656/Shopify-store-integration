import { jest } from "@jest/globals";

const mockQuery = jest.fn();

jest.unstable_mockModule("../../src/config/db.js", () => ({
  default: { query: mockQuery },
}));

const productVariantRepository = await import(
  "../../src/repositories/productVariant.repository.js"
);

describe("productVariant.repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("upsertVariant", () => {
    it("should insert/upsert a variant with all fields in order", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

      const variant = {
        productId: 1,
        shopifyVariantId: "gid://shopify/ProductVariant/1",
        title: "Small",
        sku: "SKU1",
        barcode: "123456",
        price: "19.99",
        compareAtPrice: "24.99",
        inventoryQuantity: 30,
        inventoryPolicy: "DENY",
        inventoryManagement: "SHOPIFY",
        taxable: true,
        requiresShipping: true,
        weight: 0.5,
        weightUnit: "kg",
        createdAtShopify: "2024-01-01",
        updatedAtShopify: "2024-01-02",
      };

      await productVariantRepository.upsertVariant(variant);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("ON CONFLICT (product_id, shopify_variant_id)"),
        [
          1,
          "gid://shopify/ProductVariant/1",
          "Small",
          "SKU1",
          "123456",
          "19.99",
          "24.99",
          30,
          "DENY",
          "SHOPIFY",
          true,
          true,
          0.5,
          "kg",
          "2024-01-01",
          "2024-01-02",
        ],
      );
    });
  });

  describe("findVariantsByProductId", () => {
    it("should query variants for a single product ordered by created_at_shopify", async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1, product_id: 1 }] });

      const result = await productVariantRepository.findVariantsByProductId(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY created_at_shopify ASC"),
        [1],
      );
      expect(result.rows[0].product_id).toBe(1);
    });
  });

  describe("deleteVariantsByProductId", () => {
    it("should delete variants for a product", async () => {
      mockQuery.mockResolvedValue({ rowCount: 2 });

      const result = await productVariantRepository.deleteVariantsByProductId(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("DELETE"),
        [1],
      );
      expect(result.rowCount).toBe(2);
    });
  });

  describe("findVariantsByProductIds", () => {
    it("should query variants across multiple product ids using ANY(...)", async () => {
      mockQuery.mockResolvedValue({
        rows: [
          { id: 1, product_id: 1 },
          { id: 2, product_id: 2 },
        ],
      });

      const result = await productVariantRepository.findVariantsByProductIds([1, 2]);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("product_id = ANY($1::int[])"),
        [[1, 2]],
      );
      expect(result.rows).toHaveLength(2);
    });
  });
});