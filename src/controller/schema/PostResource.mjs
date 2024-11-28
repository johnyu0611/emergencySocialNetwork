import { z } from "zod";
import {
  ResourceIdSchema,
  TimestampSchema
} from "@/controller/schema/Common.mjs";

/**
 * `POST /api/resources`
 *
 * Request payload schema
 */
export const PostResourceRequestSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Resource name is required"),
  amount: z.number().min(1, "Amount must be at least 1"),
  description: z.string().optional(),
  imageBase64: z.string().optional(),
  imageType: z.string().optional(),
  username: z.string().min(1, "Username is required"),
  resourceType: z.enum(["request", "provide"]), // New field validation
  createdAt: z.date()
});

/**
 * `POST /api/resources`
 *
 * Response payload schema
 */
export const PostResourceResponseSchema = z.object({
  id: ResourceIdSchema,
  timestamp: TimestampSchema
});

/**
 * `PATCH /api/resources`
 *
 * Request payload schema
 */
export const PatchResourceRequestSchema = z.object({
  id: z.string().uuid().min(1, "Resource ID is required"), // Resource ID to identify the resource
  amount: z.number().min(0, "Amount must be at least 0").optional(), // Updated amount (optional)
  description: z.string().optional(), // Optional updated description
  name: z.string().optional(), // Optional updated resource name
  resourceType: z.enum(["request", "provide"]).optional() // Optional updated resource type
});

/**
 * `PATCH /api/resources`
 *
 * Response payload schema
 */
export const PatchResourceResponseSchema = z.object({
  id: ResourceIdSchema, // ID of the updated resource
  updatedAt: TimestampSchema // Timestamp when the resource was updated
});

/**
 * `DELETE /api/resources`
 *
 * Request payload schema
 */
export const DeleteResourceRequestSchema = z.object({
  id: z.string().uuid().min(1, "Resource ID is required") // Resource ID to delete
});

/**
 * `DELETE /api/resources`
 *
 * Response payload schema
 */
export const DeleteResourceResponseSchema = z.object({
  id: ResourceIdSchema, // ID of the deleted resource
  deletedAt: TimestampSchema // Timestamp when the resource was deleted
});

/**
 * Resource schema for internal use
 */
export const ResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  description: z.string().optional(),
  imageBase64: z.string().optional(), // Optional base64 image data
  imageType: z.string().optional(), // Optional MIME type for image
  username: z.string(),
  resourceType: z.enum(["request", "provide"]),
  createdAt: z.date()
});

/**
 * `GET /api/resources`
 *
 * Response payload schema
 */
export const GetResourcesResponseSchema = z.object({
  resources: z.array(ResourceSchema), // Array of resources
  total: z.number() // Total count of resources
});
