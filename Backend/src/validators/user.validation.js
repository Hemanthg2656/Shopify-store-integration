import { z } from "zod";

export const userSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name should contain at least 3 characters")
      .max(100, "Name should not contain more than 100 characters")
      .regex(
        /^[a-zA-Z\s]+$/,
        "Name should contain only letters and spaces"
      ),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address")
      .max(
        255,
        "Email should not contain more than 255 characters"
      ),
  })
  .strict();

export const updateUserSchema = userSchema
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required",
    }
  );