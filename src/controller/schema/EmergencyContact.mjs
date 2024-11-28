import { UsernameSchema } from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `POST /api/users/:username/emergencycontact`
 *
 * Request payload schema
 */
export const PostRequestSchema = z.object({
  emergencyContact: z.object({
    username: UsernameSchema,
    fullName: z.string(),
    email: z.string().email()
  })
});

/**
 * `POST /api/users/:username/emergencycontact`
 *
 * Response payload schema
 */
export const PostResponseSchema = z.object({
  emergencyContact: UsernameSchema
});

/**
 * `GET /api/users/:username/emergencycontact`
 *
 * Request payload schema
 */
export const GetRequestSchema = z.object({});

/**
 * `GET /api/users/:username/emergencycontact`
 *
 * Response payload schema
 */
export const GetResponseSchema = z.object({
  curr: z.string().optional(),
  username: z.string().optional(),
  fullName: z.string().optional(),
  email: z.string().optional(),
  isOnline: z.boolean().optional()
});
