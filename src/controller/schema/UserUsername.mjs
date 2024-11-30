import { UsernameSchema } from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `PUT /api/users/:userId/username`
 *
 * Request payload schema
 */
export const PutRequestSchema = z.object({
  username: UsernameSchema
});

/**
 * `PUT /api/users/:userId/username`
 *
 * Response payload schema
 */
export const PutResponseSchema = z.object({});

/**
 * `GET /api/users/:userId/username`
 *
 * Request payload schema
 */
export const GetRequestSchema = z.object({});

/**
 * `GET /api/users/:userId/username`
 *
 * Response payload schema
 */
export const GetResponseSchema = z.object({
  username: UsernameSchema
});
