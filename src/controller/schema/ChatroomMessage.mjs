import {
  MessageContentSchema,
  TimestampSchema,
  UsernameSchema
} from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `GET /api/chatrooms/:chatroomId/messages`
 *
 * Request payload schema
 */
export const GetRequestSchema = z.object({});

/**
 * `GET /api/chatrooms/:chatroomId/messages`
 *
 * Response payload schema
 */
export const GetResponseSchema = z.object({
  messages: z.array(
    z.object({
      author: UsernameSchema,
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
  content: MessageContentSchema
});

/**
 * `POST /api/chatrooms/:chatroomId/messages`
 *
 * Response payload schema
 */
export const PostResponseSchema = z.object({});
