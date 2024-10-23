import {
  ChatroomIdSchema,
  ChatroomTitleSchema,
  UsernameSchema,
  HasUnreadSchema,
  StatusSchema
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
      id: ChatroomIdSchema.optional(),
      title: ChatroomTitleSchema.optional(),
      receiver: UsernameSchema.optional(),
      status: StatusSchema.optional(),
      hasUnread: HasUnreadSchema.optional()
    })
  )
});

/**
 * `POST /api/chatrooms`
 *
 * Request payload schema
 */
export const PostRequestSchema = z.object({
  receiver: UsernameSchema.optional()
});

/**
 * `POST /api/chatrooms`
 *
 * Response payload schema
 */
export const PostResponseSchema = z.object({
  id: ChatroomIdSchema,
  receiver: UsernameSchema.optional(),
  status: StatusSchema.optional()
});
