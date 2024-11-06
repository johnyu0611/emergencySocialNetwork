import {
  PasswordSchema,
  IsOnlineSchema,
  TokenSchema,
  UsernameSchema,
  StatusSchema
} from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `POST /api/users`
 *
 * Request payload schema
 */
export const PostRequestSchema = z.object({
  username: UsernameSchema,
  password: PasswordSchema,
  status: StatusSchema.optional()
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
export const GetRequestSchema = z.object({
  searchBy: z
    .object({
      username: z.string().optional(),
      status: z.string().optional()
    })
    .optional()
});

/**
 * `GET /api/users`
 *
 * Response payload schema
 */
export const GetResponseSchema = z.object({
  users: z.array(
    z.object({
      username: UsernameSchema,
      isOnline: IsOnlineSchema,
      status: StatusSchema
    })
  )
});
