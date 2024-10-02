import {
  MessageContentSchema,
  TimestampSchema,
  UsernameSchema
} from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `GET /api/chatrooms/:chatroomId/messages/:messageId`
 *
 * Request payload schema
 */
export const GetRequestSchema = z.object({});

/**
 * `GET /api/chatrooms/:chatroomId/messages/:messageId`
 *
 * Response payload schema
 */
export const GetResponseSchema = z.object({
  content: MessageContentSchema,
  timestamp: TimestampSchema,
  author: UsernameSchema
});
