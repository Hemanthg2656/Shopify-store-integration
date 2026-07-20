import pool from "../config/db.js";

export const upsertVariant = async (variant) => {
  const query = `
    INSERT INTO product_variants
    (
      product_id,
      shopify_variant_id,
      title,
      sku,
      barcode,
      price,
      compare_at_price,
      inventory_quantity,
      inventory_policy,
      inventory_management,
      taxable,
      requires_shipping,
      weight,
      weight_unit,
      created_at_shopify,
      updated_at_shopify
    )

    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
    )

    ON CONFLICT (product_id, shopify_variant_id)

    DO UPDATE SET
      title = EXCLUDED.title,
      sku = EXCLUDED.sku,
      barcode = EXCLUDED.barcode,
      price = EXCLUDED.price,
      compare_at_price = EXCLUDED.compare_at_price,
      inventory_quantity = EXCLUDED.inventory_quantity,
      inventory_policy = EXCLUDED.inventory_policy,
      inventory_management = EXCLUDED.inventory_management,
      taxable = EXCLUDED.taxable,
      requires_shipping = EXCLUDED.requires_shipping,
      weight = EXCLUDED.weight,
      weight_unit = EXCLUDED.weight_unit,
      created_at_shopify = EXCLUDED.created_at_shopify,
      updated_at_shopify = EXCLUDED.updated_at_shopify,
      updated_at = NOW()

    RETURNING *;
  `;

  return await pool.query(query, [
    variant.productId,
    variant.shopifyVariantId,
    variant.title,
    variant.sku,
    variant.barcode,
    variant.price,
    variant.compareAtPrice,
    variant.inventoryQuantity,
    variant.inventoryPolicy,
    variant.inventoryManagement,
    variant.taxable,
    variant.requiresShipping,
    variant.weight,
    variant.weightUnit,
    variant.createdAtShopify,
    variant.updatedAtShopify,
  ]);
};

export const findVariantsByProductId = async (productId) => {
  const query = `
    SELECT *
    FROM product_variants
    WHERE product_id = $1
    ORDER BY created_at_shopify ASC;
  `;

  return await pool.query(query, [productId]);
};

export const deleteVariantsByProductId = async (productId) => {
  const query = `
    DELETE
    FROM product_variants
    WHERE product_id = $1;
  `;

  return await pool.query(query, [productId]);
};

export const findVariantsByProductIds = async (productIds) => {
  const query = `
    SELECT *
    FROM product_variants
    WHERE product_id = ANY($1::int[])
    ORDER BY product_id, created_at_shopify ASC;
  `;

  return await pool.query(query, [productIds]);
};