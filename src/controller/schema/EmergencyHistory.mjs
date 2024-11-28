import {
  UsernameSchema,
  TimestampSchema
} from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `POST /api/users/:username/emergencycontact`
 *
 * Request payload schema
 */
export const PostRequestSchema = z.object({
  content: z.string()
});

/**
 * `POST /api/users/:username/emergencycontact`
 *
 * Response payload schema
 */
export const PostResponseSchema = z.object({
  sender: UsernameSchema.optional(),
  content: z.string().optional()
});

/**
 * `GET /api/users/:username/emergencycontact`
 *
 * Request payload schema
 */
export const GetRequestSchema = z.object({
  who: z.string().optional()
});

/**
 * `GET /api/users/:username/emergencycontact`
 *
 * Response payload schema
 */
export const GetResponseSchema = z.object({
  history: z
    .array(
      z.object({
        sender: UsernameSchema.optional(),
        timestamp: TimestampSchema.optional(),
        content: z.string().optional()
      })
    )
    .optional()
});

export const DeleteRequestSchema = z.object({
  sender: z.string(),
  timestamp: z.string(),
  content: z.string()
});

export const DeleteResponseSchema = z.object({
  message: z.string().optional()
});
