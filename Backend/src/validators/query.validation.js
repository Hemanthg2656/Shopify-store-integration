import { z } from "zod";

const MAX_LIMIT = 250;
const DEFAULT_LIMIT = 10;

export const limitSchema = z
  .string()
  .trim()
  .optional()
  .transform((val) => {
    if (val === undefined || val === "") {
      return DEFAULT_LIMIT;
    }

    return Number.parseInt(val, 10);
  })
  .refine((val) => Number.isInteger(val) && val >= 1 && val <= MAX_LIMIT, {
    message: `limit must be an integer between 1 and ${MAX_LIMIT}`,
  });

export const cursorSchema = z
  .string()
  .trim()
  .min(1)
  .max(500, "cursor is too long")
  .optional();

export const directionSchema = z
  .enum(["next", "prev"], {
    errorMap: () => ({
      message: "direction must be 'next' or 'prev'",
    }),
  })
  .optional();

export const searchSchema = z
  .string()
  .trim()
  .max(200, "search must be 200 characters or fewer")
  .optional()
  .transform((val) => (val === undefined ? "" : val));

export const dateStringSchema = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val === "" ? undefined : val))
  .refine((val) => val === undefined || /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: "date must be in YYYY-MM-DD format",
  })
  .refine(
    (val) => val === undefined || !Number.isNaN(new Date(val).getTime()),
    {
      message: "date is not a valid calendar date",
    },
  );

export const enumFilterSchema = (allowedValues, fieldName) =>
  z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === undefined || val === "" ? undefined : val))
    .refine((val) => val === undefined || allowedValues.includes(val), {
      message: `${fieldName} must be one of: ${allowedValues.join(", ")}`,
    });

export const sortSchema = (allowedValues, fallback) =>
  z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && allowedValues.includes(val) ? val : fallback));

export const pageSchema = z
  .string()
  .trim()
  .optional()
  .transform((val) => {
    if (val === undefined || val === "") {
      return 1;
    }

    return Number.parseInt(val, 10);
  })
  .refine((val) => Number.isInteger(val) && val >= 1, {
    message: "page must be an integer greater than or equal to 1",
  });
