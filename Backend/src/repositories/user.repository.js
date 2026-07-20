import pool from "../config/db.js";

export const create = async (name, email) => {
  const query = `
    INSERT INTO users(name, email)
    VALUES($1, $2)
    RETURNING *;
  `;

  return await pool.query(query, [name, email]);
};

export const findAll = async () => {
  const query = `
    SELECT *
    FROM users
    ORDER BY id ASC;
  `;

  return await pool.query(query);
};

export const findById = async (id) => {
  const query = `
    SELECT *
    FROM users
    WHERE id = $1;
  `;

  return await pool.query(query, [id]);
};

export const findByEmail = async(email)=>{
  const query = `
  SELECT * 
  FROM users
  WHERE email = $1;
  `
  return await pool.query(query,[email])
}
export const remove = async (id) => {
  const query = `
    DELETE FROM users
    WHERE id = $1
    RETURNING *;
  `;

  return await pool.query(query, [id]);
};

export const update = async (id, updates) => {
  const setClause = Object.keys(updates)
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const values = [...Object.values(updates), id];

  const query = `
    UPDATE users
    SET ${setClause},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $${values.length}
    RETURNING *;
  `;

  return await pool.query(query, values);
};