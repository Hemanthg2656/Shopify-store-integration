import pool from "../config/db.js";

export const upsertProduct = async (product) => {
  const query = `
    INSERT INTO products
    (
      store_id,
      shopify_product_id,
      title,
      description,
      status,
      product_type,
      vendor,
      price,
      total_inventory,
      created_at_shopify,
      updated_at_shopify,
      synced_at
    )
    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW()
    )
    ON CONFLICT (store_id, shopify_product_id)
    DO UPDATE
    SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      status = EXCLUDED.status,
      product_type = EXCLUDED.product_type,
      vendor = EXCLUDED.vendor,
      price = EXCLUDED.price,
      total_inventory = EXCLUDED.total_inventory,
      created_at_shopify = EXCLUDED.created_at_shopify,
      updated_at_shopify = EXCLUDED.updated_at_shopify,
      synced_at = NOW(),
      updated_at = NOW()
    RETURNING *;
  `;

  return await pool.query(query, [
    product.storeId,
    product.shopifyProductId,
    product.title,
    product.description,
    product.status,
    product.productType,
    product.vendor,
    product.price,
    product.totalInventory,
    product.createdAtShopify,
    product.updatedAtShopify,
  ]);
};

export const findProducts = async (storeId, queryParams = {}) => {
  const {
    search = "",
    status,
    productType,
    sort = "newest",
    page = 1,
    limit = 10,
  } = queryParams;

  const offset = (page - 1) * limit;

  let whereClause = `WHERE store_id = $1`;

  const values = [storeId];
  let index = 2;

  if (search) {
    whereClause += ` AND title ILIKE $${index}`;
    values.push(`%${search}%`);
    index++;
  }

  if (status) {
    whereClause += ` AND status = $${index}`;
    values.push(status.toUpperCase());
    index++;
  }

  if (productType) {
    whereClause += ` AND product_type = $${index}`;
    values.push(productType);
    index++;
  }

  let orderClause = "";

  switch (sort) {
    case "oldest":
      orderClause = `ORDER BY created_at_shopify ASC`;
      break;

    case "title":
      orderClause = `ORDER BY title ASC`;
      break;

    default:
      orderClause = `ORDER BY created_at_shopify DESC`;
  }

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM products
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, values);

  const total = Number(countResult.rows[0].total);

  const productQuery = `
    SELECT *
    FROM products
    ${whereClause}
    ${orderClause}
    LIMIT $${index}
    OFFSET $${index + 1}
  `;

  const productValues = [...values, Number(limit), offset];

  const result = await pool.query(productQuery, productValues);

  return {
    rows: result.rows,
    total,
  };
};

export const findProductByShopifyId = async (storeId, shopifyProductId) => {
  const query = `
    SELECT *
    FROM products
    WHERE
      store_id = $1
      AND shopify_product_id = $2;
  `;

  return await pool.query(query, [storeId, shopifyProductId]);
};

export const deleteProductsByStore = async (storeId) => {
  const query = `
    DELETE FROM products
    WHERE store_id = $1;
  `;

  return await pool.query(query, [storeId]);
};
