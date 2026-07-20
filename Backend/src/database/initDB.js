import pool from "../config/db.js";
import { tokenTable } from "./schema/accessToken.schema.js";
import { sessionTable } from "./schema/sessions.schema.js";
import { storeTable } from "./schema/store.schema.js";
import { userTable } from "./schema/user.schema.js";
import { syncLogTable } from "./schema/syncLog.schema.js";
import { productTable } from "./schema/product.schema.js";
import { orderTable } from "./schema/order.schema.js";
import { customerTable } from "./schema/customer.schema.js";
import { product_images } from "./schema/productImage.schema.js";
import { product_variants } from "./schema/productVariant.schema.js";

const initDB = async () => {
  try {
    await pool.query(userTable);
    await pool.query(storeTable);
    await pool.query(tokenTable);
    await pool.query(sessionTable);
    await pool.query(syncLogTable);
    await pool.query(productTable);
    await pool.query(orderTable);
    await pool.query(customerTable);
    await pool.query(product_images);
    await pool.query(product_variants);
  } catch (error) {
    console.log(error);
  }
};

export default initDB;
