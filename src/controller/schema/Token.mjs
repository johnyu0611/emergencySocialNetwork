import {
  PasswordSchema,
  TokenSchema,
  UsernameSchema
} from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `POST /api/tokens`
 *
 * Request payload schema
 */
export const PostRequestSchema = z.object({
  username: UsernameSchema,
  password: PasswordSchema
});

/**
 * `POST /api/tokens`
 *
 * Response payload schema
 */
export const PostResponseSchema = z.object({
  token: TokenSchema,
  privilege: z.string().optional()
});

/**
 * `DELETE /api/tokens`
 *
 * Request payload schema
 */
export const DeleteRequestSchema = z.object({});

/**
 * `DELETE /api/tokens`
 *
 * Response payload schema
 */
export const DeleteResponseSchema = z.object({});
