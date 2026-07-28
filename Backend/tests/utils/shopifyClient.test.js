import { jest } from "@jest/globals";
jest.unstable_mockModule("../../src/utils/logger.js", () => ({
  default: { error: jest.fn() },
}));
import { getProducts } from "../../src/utils/shopifyClient.js";

describe("shopifyClient", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getProducts", () => {
    it("should fetch products with the default limit and no page_info", async () => {
      fetch.mockResolvedValue({
        ok: true,
        headers: { get: () => null },
        json: async () => ({ products: [{ id: 1 }, { id: 2 }] }),
      });

      const result = await getProducts("demo.myshopify.com", "token");

      expect(fetch).toHaveBeenCalledTimes(1);
      const [calledUrl, options] = fetch.mock.calls[0];
      expect(calledUrl.toString()).toBe(
        "https://demo.myshopify.com/admin/api/2026-04/products.json?limit=50",
      );
      expect(options.headers["X-Shopify-Access-Token"]).toBe("token");

      expect(result).toEqual({
        products: [{ id: 1 }, { id: 2 }],
        nextPageInfo: null,
      });
    });

    it("should include a custom limit and page_info in the request URL", async () => {
      fetch.mockResolvedValue({
        ok: true,
        headers: { get: () => null },
        json: async () => ({ products: [] }),
      });

      await getProducts("demo.myshopify.com", "token", {
        limit: 100,
        pageInfo: "abc123",
      });

      const [calledUrl] = fetch.mock.calls[0];
      expect(calledUrl.toString()).toContain("limit=100");
      expect(calledUrl.toString()).toContain("page_info=abc123");
    });

    it("should extract the next page_info from a Link header when present", async () => {
      fetch.mockResolvedValue({
        ok: true,
        headers: {
          get: (key) =>
            key === "link"
              ? '<https://demo.myshopify.com/admin/api/2026-04/products.json?page_info=NEXT_CURSOR>; rel="next"'
              : null,
        },
        json: async () => ({ products: [{ id: 1 }] }),
      });

      const result = await getProducts("demo.myshopify.com", "token");

      expect(result.nextPageInfo).toBe("NEXT_CURSOR");
    });

    it("should ignore a Link header entry whose rel is not 'next'", async () => {
      fetch.mockResolvedValue({
        ok: true,
        headers: {
          get: (key) =>
            key === "link"
              ? '<https://demo.myshopify.com/admin/api/2026-04/products.json?page_info=PREV_CURSOR>; rel="previous"'
              : null,
        },
        json: async () => ({ products: [] }),
      });

      const result = await getProducts("demo.myshopify.com", "token");

      expect(result.nextPageInfo).toBeNull();
    });

    it("should return nextPageInfo null when there is no Link header at all", async () => {
      fetch.mockResolvedValue({
        ok: true,
        headers: { get: () => null },
        json: async () => ({ products: [] }),
      });

      const result = await getProducts("demo.myshopify.com", "token");

      expect(result.nextPageInfo).toBeNull();
    });

    it("should throw an Error with the response status as statusCode on a non-ok response", async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 401,
        headers: { get: () => null },
        json: async () => ({ error: "Unauthorized" }),
      });

      await expect(
        getProducts("demo.myshopify.com", "bad-token"),
      ).rejects.toMatchObject({
        message: "Unauthorized",
        statusCode: 401,
      });
    });

    it("should fall back to error_description when error is not present", async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 400,
        headers: { get: () => null },
        json: async () => ({ error_description: "Invalid request" }),
      });

      await expect(
        getProducts("demo.myshopify.com", "bad-token"),
      ).rejects.toMatchObject({
        message: "Invalid request",
        statusCode: 400,
      });
    });

    it("should fall back to a default message when neither error nor error_description is present", async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        headers: { get: () => null },
        json: async () => ({}),
      });

      await expect(
        getProducts("demo.myshopify.com", "bad-token"),
      ).rejects.toMatchObject({
        message: "Failed to fetch data",
        statusCode: 500,
      });
    });

    it("should skip a Link header entry whose URL part is missing angle brackets", async () => {
      fetch.mockResolvedValue({
        ok: true,
        headers: {
          // no `<...>` around the URL, so the regex match fails and this entry is skipped
          get: (key) =>
            key === "link"
              ? 'https://demo.myshopify.com/admin/api/2026-04/products.json?page_info=NEXT_CURSOR; rel="next"'
              : null,
        },
        json: async () => ({ products: [] }),
      });

      const result = await getProducts("demo.myshopify.com", "token");

      expect(result.nextPageInfo).toBeNull();
    });
  });
  it("uses default error message when Shopify response has no error fields", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({}), // no error, no error_description
      headers: {
        get: jest.fn(),
      },
    });

    await expect(
      getProducts("demo.myshopify.com", "token"),
    ).rejects.toMatchObject({
      message: "Failed to fetch data",
      statusCode: 500,
    });
  });
});
