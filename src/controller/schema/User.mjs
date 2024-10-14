import {
  PasswordSchema,
  IsOnlineSchema,
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

/**
 * `GET /api/users`
 *
 * Request payload schema
 */
export const GetRequestSchema = z.object({});

/**
 * `GET /api/users`
 *
 * Response payload schema
 */
export const GetResponseSchema = z.object({
  users: z.array(
    z.object({
      username: UsernameSchema,
      isOnline: IsOnlineSchema
    })
  )
});
