import { jest } from "@jest/globals";

const shopifyGraphqlClientModule =
  await import("../../src/utils/shopifyGraphqlClient.js");
const { shopifyGraphqlClient } = shopifyGraphqlClientModule;

describe("shopifyGraphqlClient", () => {
  let setTimeoutSpy;

  beforeEach(() => {
    process.env.SHOPIFY_API_VERSION = "2025-10";
    global.fetch = jest.fn();
    // Fire timers immediately so retry/backoff delays don't slow down tests
    setTimeoutSpy = jest
      .spyOn(global, "setTimeout")
      .mockImplementation((fn) => {
        fn();
        return 0;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return response data on a successful request", async () => {
    fetch.mockResolvedValue({
      status: 200,
      headers: { get: () => null },
      json: async () => ({ data: { shop: { name: "Demo" } } }),
    });

    const result = await shopifyGraphqlClient({
      shop: "demo.myshopify.com",
      accessToken: "token",
      query: "query {}",
      variables: {},
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "https://demo.myshopify.com/admin/api/2025-10/graphql.json",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Shopify-Access-Token": "token",
        }),
      }),
    );
    expect(result).toEqual({ shop: { name: "Demo" } });
  });

  it("should retry on a network failure and eventually succeed", async () => {
    fetch.mockRejectedValueOnce(new Error("ECONNRESET")).mockResolvedValueOnce({
      status: 200,
      headers: { get: () => null },
      json: async () => ({ data: { ok: true } }),
    });

    const result = await shopifyGraphqlClient({
      shop: "demo.myshopify.com",
      accessToken: "token",
      query: "query {}",
      variables: {},
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: true });
  });

  it("should throw a 502 after exhausting retries on repeated network failures", async () => {
    fetch.mockRejectedValue(new Error("ECONNRESET"));

    await expect(
      shopifyGraphqlClient({
        shop: "demo.myshopify.com",
        accessToken: "token",
        query: "query {}",
        variables: {},
      }),
    ).rejects.toMatchObject({
      message: "Failed to reach Shopify. Please try again.",
      statusCode: 502,
    });

    // MAX_RETRIES = 3 -> attempts 0,1,2,3 = 4 total calls
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it("should retry on a 429 and respect the retry-after header", async () => {
    fetch
      .mockResolvedValueOnce({
        status: 429,
        headers: { get: (key) => (key === "retry-after" ? "1" : null) },
      })
      .mockResolvedValueOnce({
        status: 200,
        headers: { get: () => null },
        json: async () => ({ data: { ok: true } }),
      });

    const result = await shopifyGraphqlClient({
      shop: "demo.myshopify.com",
      accessToken: "token",
      query: "query {}",
      variables: {},
    });

    expect(result).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("should retry on a 5xx server error and eventually throw a 502 after exhausting retries", async () => {
    fetch.mockResolvedValue({
      status: 503,
      headers: { get: () => null },
    });

    await expect(
      shopifyGraphqlClient({
        shop: "demo.myshopify.com",
        accessToken: "token",
        query: "query {}",
        variables: {},
      }),
    ).rejects.toMatchObject({
      message: "Shopify returned 503. Please try again.",
      statusCode: 502,
    });

    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it("should throw a 502 when the response body is not valid JSON", async () => {
    fetch.mockResolvedValue({
      status: 200,
      headers: { get: () => null },
      json: async () => {
        throw new Error("Unexpected token");
      },
    });

    await expect(
      shopifyGraphqlClient({
        shop: "demo.myshopify.com",
        accessToken: "token",
        query: "query {}",
        variables: {},
      }),
    ).rejects.toMatchObject({
      message: "Received an invalid response from Shopify.",
      statusCode: 502,
    });
  });

  it("should retry when the response contains a THROTTLED error and eventually succeed", async () => {
    fetch
      .mockResolvedValueOnce({
        status: 200,
        headers: { get: () => null },
        json: async () => ({
          errors: [{ extensions: { code: "THROTTLED" } }],
          extensions: {
            cost: {
              throttleStatus: { currentlyAvailable: 100, restoreRate: 50 },
              requestedQueryCost: 200,
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        status: 200,
        headers: { get: () => null },
        json: async () => ({ data: { ok: true } }),
      });

    const result = await shopifyGraphqlClient({
      shop: "demo.myshopify.com",
      accessToken: "token",
      query: "query {}",
      variables: {},
    });

    expect(result).toEqual({ ok: true });
  });

  it("should throw a 429 after exhausting retries on persistent THROTTLED errors", async () => {
    fetch.mockResolvedValue({
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        errors: [{ extensions: { code: "THROTTLED" } }],
      }),
    });

    await expect(
      shopifyGraphqlClient({
        shop: "demo.myshopify.com",
        accessToken: "token",
        query: "query {}",
        variables: {},
      }),
    ).rejects.toMatchObject({
      message:
        "Shopify is currently rate-limiting requests. Please try again shortly.",
      statusCode: 429,
    });
  });

  it("should throw a 500 immediately for a non-throttled GraphQL error", async () => {
    fetch.mockResolvedValue({
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        errors: [{ message: "Field 'foo' doesn't exist" }],
      }),
    });

    await expect(
      shopifyGraphqlClient({
        shop: "demo.myshopify.com",
        accessToken: "token",
        query: "query {}",
        variables: {},
      }),
    ).rejects.toMatchObject({
      message: "Field 'foo' doesn't exist",
      statusCode: 500,
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should use a default message when a non-throttled GraphQL error has no message", async () => {
    fetch.mockResolvedValue({
      status: 200,
      headers: { get: () => null },
      json: async () => ({ errors: [{}] }),
    });

    await expect(
      shopifyGraphqlClient({
        shop: "demo.myshopify.com",
        accessToken: "token",
        query: "query {}",
        variables: {},
      }),
    ).rejects.toMatchObject({
      message: "Shopify GraphQL request failed",
      statusCode: 500,
    });
  });

  it("should throw a 502 when the response has no data and no errors", async () => {
    fetch.mockResolvedValue({
      status: 200,
      headers: { get: () => null },
      json: async () => ({}),
    });

    await expect(
      shopifyGraphqlClient({
        shop: "demo.myshopify.com",
        accessToken: "token",
        query: "query {}",
        variables: {},
      }),
    ).rejects.toMatchObject({
      message: "Shopify returned an empty response.",
      statusCode: 502,
    });
  });
  it("should fall back to exponential backoff when currentlyAvailable already covers the requested cost", async () => {
    fetch
      .mockResolvedValueOnce({
        status: 200,
        headers: { get: () => null },
        json: async () => ({
          errors: [{ extensions: { code: "THROTTLED" } }],
          extensions: {
            cost: {
              // currentlyAvailable (500) already exceeds requestedQueryCost (100),
              // so pointsNeeded <= 0 and the exponential-backoff path is used
              throttleStatus: { currentlyAvailable: 500, restoreRate: 50 },
              requestedQueryCost: 100,
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        status: 200,
        headers: { get: () => null },
        json: async () => ({ data: { ok: true } }),
      });

    const result = await shopifyGraphqlClient({
      shop: "demo.myshopify.com",
      accessToken: "token",
      query: "query {}",
      variables: {},
    });

    expect(result).toEqual({ ok: true });
  });
  it("should use exponential backoff when throttle information is missing", async () => {
    fetch
      .mockResolvedValueOnce({
        status: 200,
        headers: { get: () => null },
        json: async () => ({
          errors: [{ extensions: { code: "THROTTLED" } }],
          // no extensions.cost
        }),
      })
      .mockResolvedValueOnce({
        status: 200,
        headers: { get: () => null },
        json: async () => ({
          data: { ok: true },
        }),
      });

    const result = await shopifyGraphqlClient({
      shop: "demo.myshopify.com",
      accessToken: "token",
      query: "query {}",
      variables: {},
    });

    expect(result).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("should use exponential backoff when restoreRate is zero", async () => {
    fetch
      .mockResolvedValueOnce({
        status: 200,
        headers: { get: () => null },
        json: async () => ({
          errors: [{ extensions: { code: "THROTTLED" } }],
          extensions: {
            cost: {
              throttleStatus: {
                currentlyAvailable: 0,
                restoreRate: 0,
              },
              requestedQueryCost: 100,
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        status: 200,
        headers: { get: () => null },
        json: async () => ({
          data: { ok: true },
        }),
      });

    const result = await shopifyGraphqlClient({
      shop: "demo.myshopify.com",
      accessToken: "token",
      query: "query {}",
      variables: {},
    });

    expect(result).toEqual({ ok: true });
  });
  it("falls back to exponential backoff when enough points are available", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    status: 200,
    json: async () => ({
      errors: [
        {
          message: "Throttled",
          extensions: {
            code: "THROTTLED",
          },
        },
      ],
      extensions: {
        cost: {
          requestedQueryCost: 10,
          throttleStatus: {
            currentlyAvailable: 20, // pointsNeeded = -10
            restoreRate: 5,
          },
        },
      },
    }),
  });

  jest.spyOn(global.Math, "random").mockReturnValue(0);

  await expect(
    shopifyGraphqlClient({
      shop: "demo.myshopify.com",
      accessToken: "token",
      query: "{}",
    }),
  ).rejects.toThrow(
    "Shopify is currently rate-limiting requests. Please try again shortly.",
  );

  Math.random.mockRestore();
});

});
