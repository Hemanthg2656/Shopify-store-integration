import pool from "../config/db.js";
import {
  encryptAccessToken,
  decryptAccessToken,
} from "../utils/tokenCrypto.js";

export const create = async (client, storeId, tokenResponse) => {
  const query = `
    INSERT INTO access_tokens(store_id,scopes,access_token)
    VALUES($1,$2,$3)
    RETURNING *;`;

  const encryptedToken = encryptAccessToken(tokenResponse.access_token);

  const values = [storeId, tokenResponse.scope, encryptedToken];
  return await client.query(query, values);
};

export const update = async (client, storeId, tokenResponse) => {
  const query = `
    UPDATE access_tokens
    SET scopes=$1,
    access_token=$2
    WHERE store_id=$3
    RETURNING *;`;

  const encryptedToken = encryptAccessToken(tokenResponse.access_token);
  const values = [tokenResponse.scope, encryptedToken, storeId];
  return await client.query(query, values);
};

export const findByStoreId = async (client, storeId) => {
  const query = `
        SELECT *
        FROM access_tokens
        WHERE store_id = $1;
    `;
  const result = await client.query(query, [storeId]);

  if (result.rows[0]) {
    result.rows[0].access_token = decryptAccessToken(
      result.rows[0].access_token,
    );
  }

  return result;
};

export const findByStoreIdFromPool = async (storeId) => {
  const query = `
    SELECT *
    FROM access_tokens
    WHERE store_id=$1;
  `;
  const result = await pool.query(query, [storeId]);

  if (result.rows[0]) {
    result.rows[0].access_token = decryptAccessToken(
      result.rows[0].access_token,
    );
  }

  return result;
};
