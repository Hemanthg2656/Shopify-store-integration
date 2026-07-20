import pool from "../config/db.js";
export const upsertCustomer = async (customer) => {
  const query = `
    INSERT INTO customers
    (
      store_id,
      shopify_customer_id,
      first_name,
      last_name,
      email,
      phone,
      orders_count,
      total_spent,
      state,
      created_at_shopify,
      updated_at_shopify,
      synced_at
    )
    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW()
    )
    ON CONFLICT (store_id, shopify_customer_id)
    DO UPDATE
    SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      orders_count = EXCLUDED.orders_count,
      total_spent = EXCLUDED.total_spent,
      state = EXCLUDED.state,
      created_at_shopify = EXCLUDED.created_at_shopify,
      updated_at_shopify = EXCLUDED.updated_at_shopify,
      synced_at = NOW(),
      updated_at = NOW()
    RETURNING *;
  `;

  return await pool.query(query, [
    customer.storeId,
    customer.shopifyCustomerId,
    customer.firstName,
    customer.lastName,
    customer.email,
    customer.phone,
    customer.ordersCount,
    customer.totalSpent,
    customer.state,
    customer.createdAtShopify,
    customer.updatedAtShopify,
  ]);
};

export const findCustomers = async (storeId, queryParams = {}) => {
  const { search = "", sort = "newest", page = 1, limit = 10 } = queryParams;

  const offset = (page - 1) * limit;

  let whereClause = `WHERE store_id = $1`;

  const values = [storeId];
  let index = 2;

  if (search) {
    whereClause += `
      AND (
        first_name ILIKE $${index}
        OR last_name ILIKE $${index}
        OR email ILIKE $${index}
      )
    `;

    values.push(`%${search}%`);
    index++;
  }

  let orderClause = "";

  switch (sort) {
    case "oldest":
      orderClause = `ORDER BY created_at_shopify ASC`;
      break;
    default:
      orderClause = `ORDER BY created_at_shopify DESC`;
  }

  const countQuery = `
      SELECT COUNT(*) AS total
      FROM customers
      ${whereClause}
  `;

  const countResult = await pool.query(countQuery, values);

  const total = Number(countResult.rows[0].total);

  const customerQuery = `
      SELECT *
      FROM customers
      ${whereClause}
      ${orderClause}
      LIMIT $${index}
      OFFSET $${index + 1}
  `;

  const result = await pool.query(customerQuery, [
    ...values,
    Number(limit),
    offset,
  ]);

  return {
    rows: result.rows,
    total,
  };
};
export const findCustomerByShopifyId = async (storeId, shopifyCustomerId) => {
  const query = `
    SELECT *
    FROM customers
    WHERE
      store_id = $1
      AND shopify_customer_id = $2;
  `;

  return await pool.query(query, [storeId, shopifyCustomerId]);
};

export const deleteCustomersByStore = async (storeId) => {
  const query = `
    DELETE FROM customers
    WHERE store_id = $1;
  `;

  return await pool.query(query, [storeId]);
};
