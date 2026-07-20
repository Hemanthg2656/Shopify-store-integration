const MAX_RETRIES = 3;
const BASE_DELAY_MS = 300;
const MAX_DELAY_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isThrottledError = (errors) =>
  Array.isArray(errors) &&
  errors.some((error) => error?.extensions?.code === "THROTTLED");

const computeBackoffMs = (attempt, throttleStatus, requestedQueryCost) => {
  if (
    throttleStatus &&
    typeof throttleStatus.currentlyAvailable === "number" &&
    typeof throttleStatus.restoreRate === "number" &&
    throttleStatus.restoreRate > 0 &&
    typeof requestedQueryCost === "number"
  ) {
    const pointsNeeded =
      requestedQueryCost - throttleStatus.currentlyAvailable;

    if (pointsNeeded > 0) {
      const waitMs = Math.ceil(
        (pointsNeeded / throttleStatus.restoreRate) * 1000,
      );

      return Math.min(MAX_DELAY_MS, Math.max(BASE_DELAY_MS, waitMs));
    }
  }

  const exponential = BASE_DELAY_MS * 2 ** attempt;
  const jitter = Math.random() * BASE_DELAY_MS;

  return Math.min(MAX_DELAY_MS, exponential + jitter);
};

export const shopifyGraphqlClient = async ({
  shop,
  accessToken,
  query,
  variables,
}) => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const isLastAttempt = attempt === MAX_RETRIES;

    let response;

    try {
      response = await fetch(
        `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({ query, variables }),
        },
      );
    } catch {
      if (!isLastAttempt) {
        await sleep(computeBackoffMs(attempt));
        continue;
      }

      const err = new Error("Failed to reach Shopify. Please try again.");
      err.statusCode = 502;
      throw err;
    }

    if (response.status === 429 || response.status >= 500) {
      if (!isLastAttempt) {
        const retryAfter = Number(response.headers.get("retry-after"));

        const waitMs =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? Math.min(MAX_DELAY_MS, retryAfter * 1000)
            : computeBackoffMs(attempt);

        await sleep(waitMs);
        continue;
      }

      const err = new Error(
        `Shopify returned ${response.status}. Please try again.`,
      );
      err.statusCode = 502;
      throw err;
    }

    let json;

    try {
      json = await response.json();
    } catch {
      const err = new Error("Received an invalid response from Shopify.");
      err.statusCode = 502;
      throw err;
    }

    if (json.errors) {
      if (isThrottledError(json.errors)) {
        if (!isLastAttempt) {
          await sleep(
            computeBackoffMs(
              attempt,
              json.extensions?.cost?.throttleStatus,
              json.extensions?.cost?.requestedQueryCost,
            ),
          );

          continue;
        }

        const err = new Error(
          "Shopify is currently rate-limiting requests. Please try again shortly.",
        );
        err.statusCode = 429;
        throw err;
      }

      const err = new Error(
        json.errors[0]?.message || "Shopify GraphQL request failed",
      );
      err.statusCode = 500;
      throw err;
    }

    if (!json.data) {
      const err = new Error("Shopify returned an empty response.");
      err.statusCode = 502;
      throw err;
    }

    return json.data;
  }
};