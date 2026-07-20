import pool from "../config/db.js";
export const create = async (client, storeData) => {
  const {
    userId,
    storeName,
    storeDomain,
    ownerName,
    email,
    planName,
    currency,
    timeZone,
  } = storeData;

  const query = `
    INSERT INTO connected_stores(
      user_id,
      store_name,
      store_domain,
      owner_name,
      email,
      plan_name,
      currency,
      time_zone
    )
    VALUES($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;

  const values = [
    userId,
    storeName,
    storeDomain,
    ownerName,
    email,
    planName,
    currency,
    timeZone,
  ];

  return await client.query(query, values);
};

export const findByStoreDomain = async (client, domain) => {
  const query = `
    SELECT * FROM connected_stores
    WHERE store_domain = $1;
    `;
  return await client.query(query, [domain]);
};

export const findStoreById = async (storeId) => {
  const query = `
  SELECT * FROM connected_stores
  WHERE id=$1;`;
  return await pool.query(query, [storeId]);
};

export const update = async (client, storeData) => {
  const { storeDomain, ...updates } = storeData;
  const values = [...Object.values(updates), storeDomain];
  const query = `
  UPDATE connected_stores
  SET
  user_id=$1,
  store_name=$2,
  owner_name=$3,
  email=$4,
  plan_name=$5,
  currency=$6,
  time_zone=$7,
  updated_at=CURRENT_TIMESTAMP
  WHERE store_domain=$8
  RETURNING *;`;
  return await client.query(query, values);
};

export const findAllStores = async () => {
  return await pool.query(`
        SELECT
            id,
            store_domain
        FROM connected_stores
    `);
};
