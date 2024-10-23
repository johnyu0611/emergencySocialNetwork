import { StateSchema } from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `GET /api/system/state`
 *
 * Request payload schema
 */

export const GetRequestSchema = z.object({});

/**
 * `GET /api/system/state`
 *
 * Response payload schema
 */
export const GetResponseSchema = z.object({
  state: StateSchema
});

/**
 * `PUT /api/system/state`
 *
 * Request payload schema
 */

export const PutRequestSchema = z.object({
  state: StateSchema
});

/**
 * `PUT /api/system/state`
 *
 * Response payload schema
 */
export const PutResponseSchema = z.object({});
