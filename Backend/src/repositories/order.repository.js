import pool from "../config/db.js";

export const upsertOrder = async (order) => {
  const query = `
    INSERT INTO orders
    (
      store_id,
      shopify_order_id,
      order_number,
      customer_name,
      customer_email,
      financial_status,
      fulfillment_status,
      currency,
      total_price,
      created_at_shopify,
      updated_at_shopify,
      synced_at
    )
    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW()
    )

    ON CONFLICT (store_id, shopify_order_id)

    DO UPDATE SET
      order_number = EXCLUDED.order_number,
      customer_name = EXCLUDED.customer_name,
      customer_email = EXCLUDED.customer_email,
      financial_status = EXCLUDED.financial_status,
      fulfillment_status = EXCLUDED.fulfillment_status,
      currency = EXCLUDED.currency,
      total_price = EXCLUDED.total_price,
      created_at_shopify = EXCLUDED.created_at_shopify,
      updated_at_shopify = EXCLUDED.updated_at_shopify,
      synced_at = NOW(),
      updated_at = NOW()

    RETURNING *;
  `;

  return await pool.query(query, [
    order.storeId,
    order.shopifyOrderId,
    order.orderNumber,
    order.customerName,
    order.customerEmail,
    order.financialStatus,
    order.fulfillmentStatus,
    order.currency,
    order.totalPrice,
    order.createdAtShopify,
    order.updatedAtShopify,
  ]);
};

export const findOrders = async (storeId, queryParams = {}) => {
  const {
    search = "",
    financialStatus,
    fulfillmentStatus,
    dateFrom,
    dateTo,
    sort = "newest",
    page = 1,
    limit = 10,
  } = queryParams;

  const offset = (page - 1) * limit;

  let whereClause = `WHERE store_id = $1`;
  const values = [storeId];
  let index = 2;
  if (search) {
    whereClause += `
      AND (
        order_number ILIKE $${index}
        OR customer_name ILIKE $${index}
        OR customer_email ILIKE $${index}
      )
    `;
    values.push(`%${search}%`);
    index++;
  }

  if (financialStatus) {
    whereClause += ` AND financial_status = $${index}`;
    values.push(financialStatus);
    index++;
  }
  if (fulfillmentStatus) {
    whereClause += ` AND fulfillment_status = $${index}`;
    values.push(fulfillmentStatus);
    index++;
  }

  if (dateFrom) {
    whereClause += ` AND DATE(created_at_shopify) >= $${index}`;
    values.push(dateFrom);
    index++;
  }

  if (dateTo) {
    whereClause += ` AND DATE(created_at_shopify) <= $${index}`;
    values.push(dateTo);
    index++;
  }

  let orderClause = "";

  switch (sort) {
    case "oldest":
      orderClause = `ORDER BY created_at_shopify ASC`;
      break;

    case "price":
      orderClause = `ORDER BY total_price DESC`;
      break;

    case "order":
      orderClause = `ORDER BY order_number ASC`;
      break;

    default:
      orderClause = `ORDER BY created_at_shopify DESC`;
  }

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM orders
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, values);
  const total = Number(countResult.rows[0].total);

  const ordersQuery = `
    SELECT *
    FROM orders
    ${whereClause}
    ${orderClause}
    LIMIT $${index}
    OFFSET $${index + 1}
  `;

  const queryValues = [...values, Number(limit), offset];

  const result = await pool.query(ordersQuery, queryValues);

  return {
    rows: result.rows,
    total,
  };
};

export const findOrderByShopifyId = async (storeId, shopifyOrderId) => {
  const query = `
    SELECT *
    FROM orders
    WHERE
      store_id = $1
      AND shopify_order_id = $2;
  `;

  return await pool.query(query, [storeId, shopifyOrderId]);
};

export const deleteOrdersByStore = async (storeId) => {
  const query = `
    DELETE FROM orders
    WHERE store_id = $1;
  `;

  return await pool.query(query, [storeId]);
};

export const getTotalRevenue = async (storeId) => {
  const result = await pool.query(
    `
    SELECT COALESCE(SUM(total_price), 0) AS total_revenue
    FROM orders
    WHERE store_id = $1
    `,
    [storeId],
  );

  return Number(result.rows[0].total_revenue);
};