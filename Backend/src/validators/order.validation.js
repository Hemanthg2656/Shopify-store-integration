import { z } from "zod";
import {
  limitSchema,
  cursorSchema,
  directionSchema,
  searchSchema,
  sortSchema,
  enumFilterSchema,
  dateStringSchema,
  pageSchema,
} from "./query.validation.js";

const ORDER_SORT_VALUES = ["newest", "oldest", "price", "order"];

const ORDER_FINANCIAL_STATUS_VALUES = [
  "PENDING",
  "AUTHORIZED",
  "PARTIALLY_PAID",
  "PAID",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
  "VOIDED",
  "EXPIRED",
];

const ORDER_FULFILLMENT_STATUS_VALUES = [
  "UNFULFILLED",
  "PARTIAL",
  "FULFILLED",
  "RESTOCKED",
  "PENDING_FULFILLMENT",
  "OPEN",
  "IN_PROGRESS",
  "ON_HOLD",
  "SCHEDULED",
  "REQUEST_DECLINED",
];

export const getOrdersQuerySchema = z
  .object({
    search: searchSchema,
    financialStatus: enumFilterSchema(
      ORDER_FINANCIAL_STATUS_VALUES,
      "financialStatus",
    ),
    fulfillmentStatus: enumFilterSchema(
      ORDER_FULFILLMENT_STATUS_VALUES,
      "fulfillmentStatus",
    ),
    dateFrom: dateStringSchema,
    dateTo: dateStringSchema,
    sort: sortSchema(ORDER_SORT_VALUES, "newest"),
    page: pageSchema,
    limit: limitSchema,
  })
  .refine(
    (data) => !data.dateFrom || !data.dateTo || data.dateFrom <= data.dateTo,
    {
      message: "dateFrom must not be after dateTo",
      path: ["dateFrom"],
    },
  );
