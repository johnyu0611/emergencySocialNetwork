import {
  ChatroomIdSchema,
  ChatroomTitleSchema
} from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `GET /api/chatrooms`
 *
 * Request payload schema
 */
export const GetRequestSchema = z.object({});

/**
 * `GET /api/chatrooms`
 *
 * Response payload schema
 */
export const GetResponseSchema = z.object({
  chatrooms: z.array(
    z.object({
      id: ChatroomIdSchema,
      title: ChatroomTitleSchema
    })
  )
});

/**
 * `POST /api/chatrooms`
 *
 * Request payload schema
 */
export const PostRequestSchema = z.object({});

/**
 * `POST /api/chatrooms`
 *
 * Response payload schema
 */
export const PostResponseSchema = z.object({
  id: ChatroomIdSchema
});
