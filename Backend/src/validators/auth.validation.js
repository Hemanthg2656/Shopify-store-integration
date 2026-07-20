import { z } from "zod";

export const shopifyInstallSchema = z.object({
  shop: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9-]+\.myshopify\.com$/, "Invalid Shopify shop domain"),
});

export const shopifyCallbackSchema = z
  .object({
    code: z.string().trim().min(1, "Authorization code is required"),
    shop: z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9-]+\.myshopify\.com$/, "Invalid Shopify shop domain"),
    state: z.string().trim().nonempty(),
    hmac: z.string().trim().nonempty(),
    host: z.string().trim().nonempty(),
    timestamp: z
      .string()
      .trim()
      .regex(/^\d+$/, "Timestamp must contain only digits"),
  })
  .strict();
