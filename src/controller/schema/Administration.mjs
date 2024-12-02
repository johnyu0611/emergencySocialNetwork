import {
  UserIdSchema,
  UsernameSchema,
  StatusSchema
} from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `GET /api/administration`
 *
 * Request payload schema
 */
export const GetRequestSchema = z.object({
  citizenId: UserIdSchema
});

/**
 * `GET /api/administration`
 *
 * Response payload schema
 */
export const GetResponseSchema = z.object({
  citizenId: UserIdSchema,
  privilege: z.string().optional(),
  status: StatusSchema.optional(),
  isOnline: z.boolean().optional(),
  isActive: z.boolean().optional(),
  username: UsernameSchema.optional()
});

/**
 * `POST /api/administration`
 *
 * Request payload schema
 */
export const PostRequestSchema = z.object({
  citizenId: UserIdSchema,
  privilege: z.string().optional(),
  validation: z.boolean(),
  isActive: z.boolean().optional(),
  password: z.string().optional(),
  username: z.string().optional()
});

/**
 * `POST /api/administration`
 *
 * Response payload schema
 */
export const PostResponseSchema = z.object({
  citizenId: UserIdSchema,
  userFlag: z.string().optional(),
  passwordFlag: z.string().optional(),
  privilege: z.string().optional(),
  status: StatusSchema.optional(),
  isOnline: z.boolean().optional(),
  isActive: z.boolean().optional(),
  username: UsernameSchema.optional()
});
