import { jest } from "@jest/globals";

// ---------- MOCKS ----------

const mockFindByStoreIdFromPool = jest.fn();

jest.unstable_mockModule(
  "../../src/repositories/accessToken.repository.js",
  () => ({
    findByStoreIdFromPool: mockFindByStoreIdFromPool,
  }),
);

const mockShopifyGraphqlClient = jest.fn();

jest.unstable_mockModule("../../src/utils/shopifyGraphqlClient.js", () => ({
  shopifyGraphqlClient: mockShopifyGraphqlClient,
}));

jest.unstable_mockModule("../../src/GraphQL/productQueries.js", () => ({
  GET_PRODUCTS: "GET_PRODUCTS_QUERY",
  GET_PRODUCTS_TYPES: "GET_PRODUCTS_TYPES_QUERY",
}));

// ---------- IMPORT SERVICE AFTER MOCKS ----------

const shopifyProductService =
  await import("../../src/service/shopifyProduct.services.js");

// ---------- HELPERS ----------

const buildProductNode = (overrides = {}) => ({
  id: "gid://shopify/Product/1",
  title: "Test Product",
  descriptionHtml: "<p>Desc</p>",
  status: "ACTIVE",
  productType: "Shirts",
  vendor: "Acme",
  totalInventory: 10,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
  images: {
    edges: [
      {
        node: {
          id: "gid://shopify/ProductImage/1",
          url: "https://cdn.shopify.com/img1.png",
          altText: "Image 1",
          width: 100,
          height: 100,
        },
      },
    ],
  },
  variants: {
    edges: [
      {
        node: {
          id: "gid://shopify/ProductVariant/1",
          title: "Default",
          sku: "SKU-1",
          barcode: "BARCODE-1",
          price: "10.00",
          compareAtPrice: "15.00",
          inventoryQuantity: 5,
          inventoryPolicy: "DENY",
          taxable: true,
          availableForSale: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-02T00:00:00.000Z",
        },
      },
    ],
  },
  ...overrides,
});

describe("shopifyProduct.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchProducts", () => {
    const userData = { storeId: 1, shop: "demo.myshopify.com" };

    it("should throw 401 when access token is not found", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      await expect(
        shopifyProductService.fetchProducts(userData, {}),
      ).rejects.toThrow("Access token not found");

      expect(mockShopifyGraphqlClient).not.toHaveBeenCalled();
    });

    it("should attach statusCode 401 to the thrown error when access token is not found", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      try {
        await shopifyProductService.fetchProducts(userData, {});
        throw new Error("Expected fetchProducts to throw");
      } catch (err) {
        expect(err.message).toBe("Access token not found");
        expect(err.statusCode).toBe(401);
      }
    });

    it("should map product edges into the expected shape", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token123" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        products: {
          edges: [{ node: buildProductNode() }],
          pageInfo: { hasNextPage: false, hasPreviousPage: false },
        },
      });

      const result = await shopifyProductService.fetchProducts(userData, {});

      expect(result.products).toHaveLength(1);
      expect(result.products[0]).toEqual({
        shopifyProductId: "gid://shopify/Product/1",
        title: "Test Product",
        description: "<p>Desc</p>",
        status: "ACTIVE",
        productType: "Shirts",
        vendor: "Acme",
        price: "10.00",
        totalInventory: 10,
        createdAtShopify: "2024-01-01T00:00:00.000Z",
        updatedAtShopify: "2024-01-02T00:00:00.000Z",
        images: [
          {
            shopifyImageId: "gid://shopify/ProductImage/1",
            imageUrl: "https://cdn.shopify.com/img1.png",
            altText: "Image 1",
            width: 100,
            height: 100,
          },
        ],
        variants: [
          {
            shopifyVariantId: "gid://shopify/ProductVariant/1",
            title: "Default",
            sku: "SKU-1",
            barcode: "BARCODE-1",
            price: "10.00",
            compareAtPrice: "15.00",
            inventoryQuantity: 5,
            inventoryPolicy: "DENY",
            taxable: true,
            availableForSale: true,
            createdAtShopify: "2024-01-01T00:00:00.000Z",
            updatedAtShopify: "2024-01-02T00:00:00.000Z",
          },
        ],
      });

      expect(result.pageInfo).toEqual({
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it("should set price to null when there are no variants", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token123" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        products: {
          edges: [
            {
              node: buildProductNode({
                variants: { edges: [] },
              }),
            },
          ],
          pageInfo: {},
        },
      });

      const result = await shopifyProductService.fetchProducts(userData, {});

      expect(result.products[0].price).toBeNull();
      expect(result.products[0].variants).toEqual([]);
    });

    it("should decrypt/use access token from the repository result when calling the graphql client", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "secret-token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        products: { edges: [], pageInfo: {} },
      });

      await shopifyProductService.fetchProducts(userData, {});

      expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
        expect.objectContaining({
          shop: "demo.myshopify.com",
          accessToken: "secret-token",
          query: "GET_PRODUCTS_QUERY",
        }),
      );
    });

    it("should build a search filter when search is provided", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        products: { edges: [], pageInfo: {} },
      });

      await shopifyProductService.fetchProducts(userData, {
        search: "shirt",
      });

      expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            query: "title:*shirt*",
          }),
        }),
      );
    });

    it("should build a status filter when status is provided", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        products: { edges: [], pageInfo: {} },
      });

      await shopifyProductService.fetchProducts(userData, {
        status: "ACTIVE",
      });

      expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            query: "status:ACTIVE",
          }),
        }),
      );
    });

    it("should build a productType filter when productType is provided", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        products: { edges: [], pageInfo: {} },
      });

      await shopifyProductService.fetchProducts(userData, {
        productType: "Shoes",
      });

      expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            query: "product_type:Shoes",
          }),
        }),
      );
    });

    it("should combine search, status and productType filters with spaces", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        products: { edges: [], pageInfo: {} },
      });

      await shopifyProductService.fetchProducts(userData, {
        search: "shirt",
        status: "ACTIVE",
        productType: "Shoes",
      });

      expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            query: "title:*shirt* status:ACTIVE product_type:Shoes",
          }),
        }),
      );
    });

    it("should use CREATED_AT descending sort by default (newest)", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        products: { edges: [], pageInfo: {} },
      });

      await shopifyProductService.fetchProducts(userData, {});

      expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            sortKey: "CREATED_AT",
            reverse: true,
          }),
        }),
      );
    });

    it("should use CREATED_AT ascending sort for oldest", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        products: { edges: [], pageInfo: {} },
      });

      await shopifyProductService.fetchProducts(userData, {
        sort: "oldest",
      });

      expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            sortKey: "CREATED_AT",
            reverse: false,
          }),
        }),
      );
    });

    it("should use TITLE ascending sort for title", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        products: { edges: [], pageInfo: {} },
      });

      await shopifyProductService.fetchProducts(userData, {
        sort: "title",
      });

      expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            sortKey: "TITLE",
            reverse: false,
          }),
        }),
      );
    });

    it("should set first/after when direction is 'next'", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        products: { edges: [], pageInfo: {} },
      });

      await shopifyProductService.fetchProducts(userData, {
        direction: "next",
        cursor: "cursor123",
        limit: 20,
      });

      expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            first: 20,
            after: "cursor123",
          }),
        }),
      );
    });

    it("should set last/before when direction is 'prev'", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        products: { edges: [], pageInfo: {} },
      });

      await shopifyProductService.fetchProducts(userData, {
        direction: "prev",
        cursor: "cursor456",
        limit: 20,
      });

      expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            last: 20,
            before: "cursor456",
          }),
        }),
      );
    });

    it("should default to first=limit when no direction is provided", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        products: { edges: [], pageInfo: {} },
      });

      await shopifyProductService.fetchProducts(userData, {});

      expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            first: 250,
          }),
        }),
      );
    });

    it("should coerce a string limit to a number", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        products: { edges: [], pageInfo: {} },
      });

      await shopifyProductService.fetchProducts(userData, {
        limit: "50",
      });

      expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            first: 50,
          }),
        }),
      );
    });

    it("should propagate errors thrown by the graphql client", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token" }],
      });

      mockShopifyGraphqlClient.mockRejectedValue(
        new Error("Shopify GraphQL request failed"),
      );

      await expect(
        shopifyProductService.fetchProducts(userData, {}),
      ).rejects.toThrow("Shopify GraphQL request failed");
    });
  });

  describe("fetchProductTypes", () => {
    const userData = { storeId: 1, shop: "demo.myshopify.com" };

    it("should throw when access token is not found", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 0,
        rows: [],
      });

      await expect(
        shopifyProductService.fetchProductTypes(userData),
      ).rejects.toThrow("Access token not found");

      expect(mockShopifyGraphqlClient).not.toHaveBeenCalled();
    });

    it("should call the graphql client with GET_PRODUCTS_TYPES and default pagination variables", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token123" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        productTypes: { edges: [] },
      });

      await shopifyProductService.fetchProductTypes(userData);

      expect(mockShopifyGraphqlClient).toHaveBeenCalledWith({
        shop: "demo.myshopify.com",
        accessToken: "token123",
        query: "GET_PRODUCTS_TYPES_QUERY",
        variables: { first: 100, after: null },
      });
    });

    it("should map productTypes edges to their node values", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token123" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        productTypes: {
          edges: [{ node: "Shirts" }, { node: "Shoes" }],
        },
      });

      const result = await shopifyProductService.fetchProductTypes(userData);

      expect(result).toEqual(["Shirts", "Shoes"]);
    });

    it("should return an empty array when there are no product types", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token123" }],
      });

      mockShopifyGraphqlClient.mockResolvedValue({
        productTypes: { edges: [] },
      });

      const result = await shopifyProductService.fetchProductTypes(userData);

      expect(result).toEqual([]);
    });

    it("should propagate errors thrown by the graphql client", async () => {
      mockFindByStoreIdFromPool.mockResolvedValue({
        rowCount: 1,
        rows: [{ access_token: "token123" }],
      });

      mockShopifyGraphqlClient.mockRejectedValue(new Error("Network error"));

      await expect(
        shopifyProductService.fetchProductTypes(userData),
      ).rejects.toThrow("Network error");
    });
  });

  describe("generateShopifyProductLink", () => {
    it("should extract the numeric id from a gid and build the admin link", async () => {
      const userData = { shop: "demo.myshopify.com" };

      const link = await shopifyProductService.generateShopifyProductLink(
        userData,
        "gid://shopify/Product/456",
      );

      expect(link).toBe("https://demo.myshopify.com/admin/products/456");
    });

    it("should just append a plain id if no slashes are present", async () => {
      const userData = { shop: "demo.myshopify.com" };

      const link = await shopifyProductService.generateShopifyProductLink(
        userData,
        "456",
      );

      expect(link).toBe("https://demo.myshopify.com/admin/products/456");
    });
  });
  it("should use the default queryParams when no second argument is provided", async () => {
    mockFindByStoreIdFromPool.mockResolvedValue({
      rowCount: 1,
      rows: [{ access_token: "token123" }],
    });

    mockShopifyGraphqlClient.mockResolvedValue({
      products: {
        edges: [],
        pageInfo: {},
      },
    });

    await shopifyProductService.fetchProducts({
      storeId: 1,
      shop: "demo.myshopify.com",
    });

    expect(mockShopifyGraphqlClient).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          query: "",
          sortKey: "CREATED_AT",
          reverse: true,
          first: 250,
        }),
      }),
    );
  });
});
