import { jest } from "@jest/globals";

const mockFindProducts = jest.fn();

jest.unstable_mockModule(
  "../../src/repositories/product.repository.js",
  () => ({
    findProducts: mockFindProducts,
  }),
);

const mockFetchProductTypes = jest.fn();
const mockGenerateShopifyProductLink = jest.fn();

jest.unstable_mockModule(
  "../../src/service/shopifyProduct.services.js",
  () => ({
    fetchProductTypes: mockFetchProductTypes,
    generateShopifyProductLink: mockGenerateShopifyProductLink,
  }),
);

const mockFindImagesByProductIds = jest.fn();

jest.unstable_mockModule(
  "../../src/repositories/productImage.repository.js",
  () => ({
    findImagesByProductIds: mockFindImagesByProductIds,
  }),
);

const mockFindVariantsByProductIds = jest.fn();

jest.unstable_mockModule(
  "../../src/repositories/productVariant.repository.js",
  () => ({
    findVariantsByProductIds: mockFindVariantsByProductIds,
  }),
);

// ---------- IMPORT SERVICE AFTER MOCKS ----------

const productService = await import("../../src/service/product.services.js");

describe("product.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProducts", () => {
    const userData = { storeId: 1 };

    it("should return empty products array when no rows found", async () => {
      mockFindProducts.mockResolvedValue({
        rows: [],
        total: 0,
      });

      const result = await productService.getProducts(userData, {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        products: [],
        pageInfo: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });

      expect(mockFindImagesByProductIds).not.toHaveBeenCalled();
      expect(mockFindVariantsByProductIds).not.toHaveBeenCalled();
    });

    it("should default page and limit when not provided in queryParams", async () => {
      mockFindProducts.mockResolvedValue({
        rows: [],
        total: 0,
      });

      const result = await productService.getProducts(userData, {});

      expect(mockFindProducts).toHaveBeenCalledWith(1, {});
      expect(result.pageInfo.page).toBe(1);
      expect(result.pageInfo.limit).toBe(10);
    });

    it("should map products with their images and variants", async () => {
      mockFindProducts.mockResolvedValue({
        rows: [
          {
            id: 1,
            shopify_product_id: "gid://shopify/Product/1",
            title: "T-Shirt",
            description: "A shirt",
            status: "ACTIVE",
            vendor: "Acme",
            product_type: "Apparel",
            price: "19.99",
            total_inventory: 50,
            created_at_shopify: "2024-01-01T00:00:00.000Z",
            updated_at_shopify: "2024-01-02T00:00:00.000Z",
          },
          {
            id: 2,
            shopify_product_id: "gid://shopify/Product/2",
            title: "Mug",
            description: "A mug",
            status: "DRAFT",
            vendor: "Acme",
            product_type: "Home",
            price: "9.99",
            total_inventory: 20,
            created_at_shopify: "2024-01-03T00:00:00.000Z",
            updated_at_shopify: "2024-01-04T00:00:00.000Z",
          },
        ],
        total: 2,
      });

      mockFindImagesByProductIds.mockResolvedValue({
        rows: [
          { product_id: 1, id: 100, image_url: "img1.png", position: 1 },
          { product_id: 1, id: 101, image_url: "img2.png", position: 2 },
        ],
      });

      mockFindVariantsByProductIds.mockResolvedValue({
        rows: [
          {
            product_id: 1,
            id: 200,
            title: "Small",
            sku: "SKU1",
            price: "19.99",
            inventory_quantity: 30,
            inventory_policy: "DENY",
            inventory_management: "SHOPIFY",
          },
        ],
      });

      const result = await productService.getProducts(userData, {
        page: 1,
        limit: 10,
      });

      expect(mockFindProducts).toHaveBeenCalledWith(1, { page: 1, limit: 10 });
      expect(mockFindImagesByProductIds).toHaveBeenCalledWith([1, 2]);
      expect(mockFindVariantsByProductIds).toHaveBeenCalledWith([1, 2]);

      expect(result.products).toHaveLength(2);

      expect(result.products[0]).toEqual({
        id: 1,
        shopifyProductId: "gid://shopify/Product/1",
        title: "T-Shirt",
        description: "A shirt",
        status: "ACTIVE",
        vendor: "Acme",
        productType: "Apparel",
        price: "19.99",
        totalInventory: 50,
        images: [
          { product_id: 1, id: 100, image_url: "img1.png", position: 1 },
          { product_id: 1, id: 101, image_url: "img2.png", position: 2 },
        ],
        variants: [
          {
            id: 200,
            title: "Small",
            sku: "SKU1",
            price: "19.99",
            inventoryQuantity: 30,
            inventoryPolicy: "DENY",
            inventoryManagement: "SHOPIFY",
          },
        ],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      });

      // product 2 has no matching images/variants rows
      expect(result.products[1].images).toEqual([]);
      expect(result.products[1].variants).toEqual([]);
    });

    it("should only attach images/variants to the product id they belong to", async () => {
      mockFindProducts.mockResolvedValue({
        rows: [{ id: 1 }, { id: 2 }],
        total: 2,
      });

      mockFindImagesByProductIds.mockResolvedValue({
        rows: [{ product_id: 2, id: 300, image_url: "mug.png" }],
      });

      mockFindVariantsByProductIds.mockResolvedValue({
        rows: [
          {
            product_id: 2,
            id: 400,
            title: "Default",
            sku: "MUG-1",
            price: "9.99",
            inventory_quantity: 15,
            inventory_policy: "CONTINUE",
            inventory_management: "SHOPIFY",
          },
        ],
      });

      const result = await productService.getProducts(userData, {
        page: 1,
        limit: 10,
      });

      expect(result.products[0].images).toEqual([]);
      expect(result.products[0].variants).toEqual([]);

      expect(result.products[1].images).toHaveLength(1);
      expect(result.products[1].variants).toHaveLength(1);
    });

    it("should group multiple variants belonging to the same product", async () => {
      mockFindProducts.mockResolvedValue({
        rows: [{ id: 1 }],
        total: 1,
      });

      mockFindImagesByProductIds.mockResolvedValue({ rows: [] });

      mockFindVariantsByProductIds.mockResolvedValue({
        rows: [
          {
            product_id: 1,
            id: 200,
            title: "Small",
            sku: "SKU1",
            price: "19.99",
            inventory_quantity: 30,
            inventory_policy: "DENY",
            inventory_management: "SHOPIFY",
          },
          {
            product_id: 1,
            id: 201,
            title: "Large",
            sku: "SKU2",
            price: "21.99",
            inventory_quantity: 12,
            inventory_policy: "DENY",
            inventory_management: "SHOPIFY",
          },
        ],
      });

      const result = await productService.getProducts(userData, {
        page: 1,
        limit: 10,
      });

      expect(result.products[0].variants).toHaveLength(2);
      expect(result.products[0].variants[0].sku).toBe("SKU1");
      expect(result.products[0].variants[1].sku).toBe("SKU2");
    });

    it("should compute totalPages, hasPreviousPage and hasNextPage correctly for a middle page", async () => {
      mockFindProducts.mockResolvedValue({
        rows: [{ id: 1 }],
        total: 25,
      });

      mockFindImagesByProductIds.mockResolvedValue({ rows: [] });
      mockFindVariantsByProductIds.mockResolvedValue({ rows: [] });

      const result = await productService.getProducts(userData, {
        page: 2,
        limit: 10,
      });

      expect(result.pageInfo).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasPreviousPage: true,
        hasNextPage: true,
      });
    });

    it("should set hasNextPage false on the last page", async () => {
      mockFindProducts.mockResolvedValue({
        rows: [{ id: 1 }],
        total: 20,
      });

      mockFindImagesByProductIds.mockResolvedValue({ rows: [] });
      mockFindVariantsByProductIds.mockResolvedValue({ rows: [] });

      const result = await productService.getProducts(userData, {
        page: 2,
        limit: 10,
      });

      expect(result.pageInfo.totalPages).toBe(2);
      expect(result.pageInfo.hasNextPage).toBe(false);
      expect(result.pageInfo.hasPreviousPage).toBe(true);
    });

    it("should set hasPreviousPage false on the first page", async () => {
      mockFindProducts.mockResolvedValue({
        rows: [{ id: 1 }],
        total: 20,
      });

      mockFindImagesByProductIds.mockResolvedValue({ rows: [] });
      mockFindVariantsByProductIds.mockResolvedValue({ rows: [] });

      const result = await productService.getProducts(userData, {
        page: 1,
        limit: 10,
      });

      expect(result.pageInfo.hasPreviousPage).toBe(false);
      expect(result.pageInfo.hasNextPage).toBe(true);
    });

    it("should coerce string page/limit query params to numbers", async () => {
      mockFindProducts.mockResolvedValue({
        rows: [{ id: 1 }],
        total: 10,
      });

      mockFindImagesByProductIds.mockResolvedValue({ rows: [] });
      mockFindVariantsByProductIds.mockResolvedValue({ rows: [] });

      const result = await productService.getProducts(userData, {
        page: "1",
        limit: "5",
      });

      expect(result.pageInfo.page).toBe(1);
      expect(result.pageInfo.limit).toBe(5);
      expect(result.pageInfo.totalPages).toBe(2);
    });

    it("should propagate errors from findProducts", async () => {
      mockFindProducts.mockRejectedValue(new Error("Database error"));

      await expect(
        productService.getProducts(userData, { page: 1, limit: 10 }),
      ).rejects.toThrow("Database error");
    });
  });

  describe("getProductTypes", () => {
    it("should delegate to shopifyProductServices.fetchProductTypes", async () => {
      const userData = { storeId: 1, shop: "demo.myshopify.com" };
      const types = [{ node: "Apparel" }, { node: "Home" }];

      mockFetchProductTypes.mockResolvedValue(types);

      const result = await productService.getProductTypes(userData);

      expect(mockFetchProductTypes).toHaveBeenCalledWith(userData);
      expect(result).toEqual(types);
    });

    it("should propagate errors from fetchProductTypes", async () => {
      mockFetchProductTypes.mockRejectedValue(
        new Error("Access token not found"),
      );

      await expect(
        productService.getProductTypes({
          storeId: 1,
          shop: "demo.myshopify.com",
        }),
      ).rejects.toThrow("Access token not found");
    });
  });

  describe("getProductShopifyLink", () => {
    it("should delegate to shopifyProductServices.generateShopifyProductLink and return its resolved value", async () => {
      const userData = { storeId: 1, shop: "demo.myshopify.com" };
      const productId = "gid://shopify/Product/55";
      const link = "https://demo.myshopify.com/admin/products/55";

      // generateShopifyProductLink is async in the real implementation
      mockGenerateShopifyProductLink.mockResolvedValue(link);

      const result = await productService.getProductShopifyLink(
        userData,
        productId,
      );

      expect(mockGenerateShopifyProductLink).toHaveBeenCalledWith(
        userData,
        productId,
      );
      expect(result).toBe(link);
    });

    it("should propagate errors from generateShopifyProductLink", async () => {
      mockGenerateShopifyProductLink.mockRejectedValue(
        new Error("Invalid product id"),
      );

      await expect(
        productService.getProductShopifyLink(
          { storeId: 1, shop: "demo.myshopify.com" },
          "bad-id",
        ),
      ).rejects.toThrow("Invalid product id");
    });
  });
  it("should use empty arrays when images and variants are missing", async () => {
    mockFindProducts.mockResolvedValue({
      rows: [
        {
          id: 1,
          shopify_product_id: "1",
          title: "Product",
          description: "",
          status: "ACTIVE",
          vendor: "Vendor",
          product_type: "Type",
          price: "10",
          total_inventory: 5,
          created_at_shopify: "2024",
          updated_at_shopify: "2024",
        },
      ],
      total: 1,
    });

    mockFindImagesByProductIds.mockResolvedValue({
      rows: [],
    });

    mockFindVariantsByProductIds.mockResolvedValue({
      rows: [],
    });

    const result = await productService.getProducts({ storeId: 1 }, {});

    expect(result.products[0].images).toEqual([]);
    expect(result.products[0].variants).toEqual([]);
  });
});
