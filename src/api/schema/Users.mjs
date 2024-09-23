import {
  ErrorReasonSchema,
  PasswordSchema,
  TokenSchema,
  UsernameSchema
} from "@/api/schema/Common.mjs";
import { z } from "zod";

/**
 * `POST /api/auth/users`
 *
 * Request payload schema
 */
export const PostRequestSchema = z.object({
  username: UsernameSchema,
  password: PasswordSchema
});

/**
 * `POST /api/auth/users`
 *
 * Response payload schema
 */
export const PostResponseSchema = z.union([
  z.object({
    token: TokenSchema
  }),
  z.object({
    reason: ErrorReasonSchema
  })
]);
