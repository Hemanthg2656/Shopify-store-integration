import * as productRepository from "../repositories/product.repository.js";
import * as shopifyProductServices from "./shopifyProduct.services.js";
import * as imageRepository from "../repositories/productImage.repository.js";
import * as variantRepository from "../repositories/productVariant.repository.js";

export const getProducts = async (userData, queryParams) => {
  const page = Number(queryParams.page || 1);
  const limit = Number(queryParams.limit || 10);

  const { rows, total } = await productRepository.findProducts(
    userData.storeId,
    queryParams,
  );

  const totalPages = Math.ceil(total / limit);

  if (rows.length === 0) {
    return {
      products: [],
      pageInfo: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }
  const productIds = rows.map((product) => product.id);

  const imageResult = await imageRepository.findImagesByProductIds(productIds);

  const variantResult =
    await variantRepository.findVariantsByProductIds(productIds);
  const imagesMap = {};

  for (const image of imageResult.rows) {
    if (!imagesMap[image.product_id]) {
      imagesMap[image.product_id] = [];
    }

    imagesMap[image.product_id].push(image);
  }
  const variantsMap = {};

  for (const variant of variantResult.rows) {
    if (!variantsMap[variant.product_id]) {
      variantsMap[variant.product_id] = [];
    }

    variantsMap[variant.product_id].push({
      id: variant.id,
      title: variant.title,
      sku: variant.sku,
      price: variant.price,
      inventoryQuantity: variant.inventory_quantity,
      inventoryPolicy: variant.inventory_policy,
      inventoryManagement: variant.inventory_management,
    });
  }
  const products = rows.map((product) => ({
    id: product.id,
    shopifyProductId: product.shopify_product_id,
    title: product.title,
    description: product.description,
    status: product.status,
    vendor: product.vendor,
    productType: product.product_type,
    price: product.price,
    totalInventory: product.total_inventory,

    images: imagesMap[product.id] || [],
    variants: variantsMap[product.id] || [],

    createdAt: product.created_at_shopify,
    updatedAt: product.updated_at_shopify,
  }));

  return {
    products,
    pageInfo: {
      page,
      limit,
      total,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
};



export const getProductTypes = async (userData) => {
  return await shopifyProductServices.fetchProductTypes(userData);
};



export const getProductShopifyLink = async (userData, productId) => {

  return shopifyProductServices.generateShopifyProductLink(userData, productId);
};
