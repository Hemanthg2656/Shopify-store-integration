import { z } from "zod";
import {
  pageSchema,
  limitSchema,
  searchSchema,
  sortSchema,
  enumFilterSchema,
} from "./query.validation.js";

const PRODUCT_SORT_VALUES = ["newest", "oldest", "title"];
const PRODUCT_STATUS_VALUES = ["active", "draft", "archived"];

export const getProductsQuerySchema = z.object({
  search: searchSchema,
  status: enumFilterSchema(PRODUCT_STATUS_VALUES, "status"),
  productType: z
    .string()
    .trim()
    .max(255, "productType must be 255 characters or fewer")
    .optional()
    .transform((val) => (val === undefined || val === "" ? undefined : val)),
  sort: sortSchema(PRODUCT_SORT_VALUES, "newest"),
  page: pageSchema,
  limit: limitSchema,
});
