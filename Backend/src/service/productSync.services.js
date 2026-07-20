import * as syncLogServices from "./syncLog.services.js";
import * as shopifyProductServices from "./shopifyProduct.services.js";
import * as productRepository from "../repositories/product.repository.js";
import * as imageRepository from "../repositories/productImage.repository.js";
import * as variantRepository from "../repositories/productVariant.repository.js";

export const syncProducts = async (userData, syncType = "MANUAL") => {
  const { storeId } = userData;
  const syncLog = await syncLogServices.createSyncLog(
    storeId,
    syncType,
    "PRODUCTS",
  );

  try {
    const { products } = await shopifyProductServices.fetchProducts(userData, {
      limit: 250,
    });

    for (const product of products) {
      const result = await productRepository.upsertProduct({
        storeId,
        ...product,
      });

      const productId = result.rows[0].id;

      await imageRepository.deleteImagesByProductId(productId);

      for (const image of product.images) {
        await imageRepository.upsertProductImage({
          productId,
          ...image,
        });
      }

      await variantRepository.deleteVariantsByProductId(productId);

      for (const variant of product.variants) {
        await variantRepository.upsertVariant({
          productId,
          ...variant,
        });
      }
    }
    await syncLogServices.updateSyncLog(
      syncLog.id,
      "SUCCESS",
      products.length,
      null,
    );

    return {
      synced: products.length,
    };
  } catch (error) {
    await syncLogServices.updateSyncLog(syncLog.id, "FAILED", 0, error.message);

    throw error;
  }
};
