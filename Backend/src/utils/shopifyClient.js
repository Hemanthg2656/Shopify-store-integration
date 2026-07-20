
const extractPageInfo = (linkHeader, rel = "next") => {
  if (!linkHeader) return null;

  const links = linkHeader.split(",");

  for (const link of links) {
    const [urlPart, relPart] = link.split(";");
    if (!relPart || !relPart.includes(`rel="${rel}"`)) continue;

    const match = urlPart.match(/<(.+)>/);
    if (!match) continue;

    const url = new URL(match[1].trim());
    return url.searchParams.get("page_info");
  }

  return null;
};

export const getProducts = async (
  shop,
  accessToken,
  { limit = 50, pageInfo } = {},
) => {
  const url = new URL(`https://${shop}/admin/api/2026-04/products.json`);
  url.searchParams.set("limit", limit);
  if (pageInfo) url.searchParams.set("page_info", pageInfo);

  const response = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  });

  const responseData = await response.json();
  if (!response.ok) {
    logger.error(
      { shop, status: response.status },
      "Shopify returned an error",
    );
    const err = new Error(
      responseData.error ||
        responseData.error_description ||
        "Failed to fetch data",
    );
    err.statusCode = response.status;
    throw err;
  }

  const linkHeader = response.headers.get("link");
  const nextPageInfo = extractPageInfo(linkHeader, "next");

  return { products: responseData.products, nextPageInfo };
};
