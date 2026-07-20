import pool from "../config/db.js";

export const create = async (userId, storeId) => {
  const query = `
    INSERT INTO sessions
    (
      user_id,
      store_id,
      expires_at
    )
    VALUES
    (
      $1,
      $2,
      NOW() + INTERVAL '30 days'
    )
    RETURNING *;
  `;

  return await pool.query(query, [userId, storeId]);
};

export const findSessionById = async (sessionId) => {
  const query = `
    SELECT *
    FROM sessions
    WHERE id = $1
      AND revoked_at IS NULL;
  `;

  return await pool.query(query, [sessionId]);
};

export const updateRefreshToken = async (sessionId, refreshToken) => {
  const query = `
  UPDATE sessions
  SET refresh_token = $2
  WHERE id = $1
  RETURNING *;`;
  return await pool.query(query, [sessionId, refreshToken]);
};

export const revokeActiveSession = async (userId, storeId) => {
  const query = `
    UPDATE sessions
    SET revoked_at = NOW()
    WHERE
      user_id = $1
      AND store_id = $2
      AND revoked_at IS NULL;
  `;
  return await pool.query(query, [userId, storeId]);
};

export const revokeSession = async (sessionId) => {
  const query = `
    UPDATE sessions
    SET revoked_at = NOW()
    WHERE id = $1
    AND revoked_at IS NULL
    RETURNING *;
  `;

  return await pool.query(query, [sessionId]);
};

export const deleteExpiredSessions = async () => {
  return await pool.query(`
    DELETE FROM sessions
    WHERE expires_at < NOW();
  `);
};
