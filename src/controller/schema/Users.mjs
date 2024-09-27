import {
  PasswordSchema,
  TokenSchema,
  UsernameSchema
} from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `POST /api/users`
 *
 * Request payload schema
 */
export const PostRequestSchema = z.object({
  username: UsernameSchema,
  password: PasswordSchema
});

/**
 * `POST /api/users`
 *
 * Response payload schema
 */
export const PostResponseSchema = z.object({
  token: TokenSchema
});
