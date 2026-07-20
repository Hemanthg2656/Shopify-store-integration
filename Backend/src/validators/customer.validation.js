import { z } from "zod";
import {
  limitSchema,
  searchSchema,
  sortSchema,
  pageSchema,
} from "./query.validation.js";

const CUSTOMER_SORT_VALUES = ["newest", "oldest"];

export const getCustomersQuerySchema = z.object({
  search: searchSchema,
  sort: sortSchema(CUSTOMER_SORT_VALUES, "newest"),
   page: pageSchema,
  limit: limitSchema,
});
