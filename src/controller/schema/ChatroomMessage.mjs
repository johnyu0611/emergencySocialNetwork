import {
  MessageContentSchema,
  MessageIdSchema,
  TimestampSchema,
  UsernameSchema,
  StatusSchema
} from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `GET /api/chatrooms/:chatroomId/messages`
 *
 * Request payload schema
 */
export const GetRequestSchema = z.object({
  searchBy: z
    .object({
      content: z.string().optional()
    })
    .optional()
});

/**
 * `GET /api/chatrooms/:chatroomId/messages`
 *
 * Response payload schema
 */
export const GetResponseSchema = z.object({
  messages: z.array(
    z.object({
      id: MessageIdSchema,
      sender: UsernameSchema,
      receiver: UsernameSchema.optional(), // not need for public
      status: StatusSchema.optional(),
      timestamp: TimestampSchema,
      content: MessageContentSchema
    })
  )
});

/**
 * `POST /api/chatrooms/:chatroomId/messages`
 *
 * Request payload schema
 */
export const PostRequestSchema = z.object({
  receiver: UsernameSchema.optional(),
  content: MessageContentSchema
});

/**
 * `POST /api/chatrooms/:chatroomId/messages`
 *
 * Response payload schema
 */
export const PostResponseSchema = z.object({
  id: MessageIdSchema
});
