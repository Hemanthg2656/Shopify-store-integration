import pool from "../config/db.js";

export const upsertProductImage = async (image) => {
  const query = `
    INSERT INTO product_images
    (
      product_id,
      shopify_image_id,
      image_url,
      alt_text,
      position,
      width,
      height
    )

    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7
    )

    ON CONFLICT (product_id, shopify_image_id)

    DO UPDATE SET
      image_url = EXCLUDED.image_url,
      alt_text = EXCLUDED.alt_text,
      position = EXCLUDED.position,
      width = EXCLUDED.width,
      height = EXCLUDED.height,
      updated_at = NOW()

    RETURNING *;
  `;

  return await pool.query(query, [
    image.productId,
    image.shopifyImageId,
    image.imageUrl,
    image.altText,
    image.position,
    image.width,
    image.height,
  ]);
};

export const findImagesByProductId = async (productId) => {
  const query = `
    SELECT *
    FROM product_images
    WHERE product_id = $1
    ORDER BY position ASC;
  `;

  return await pool.query(query, [productId]);
};

export const deleteImagesByProductId = async (productId) => {
  const query = `
    DELETE
    FROM product_images
    WHERE product_id = $1;
  `;

  return await pool.query(query, [productId]);
};

export const findImagesByProductIds = async (productIds) => {
  const query = `
    SELECT *
    FROM product_images
    WHERE product_id = ANY($1::int[])
    ORDER BY product_id, position ASC;
  `;

  return await pool.query(query, [productIds]);
};