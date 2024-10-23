import {
  MessageContentSchema,
  MessageIdSchema,
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
  id: MessageIdSchema,
  content: MessageContentSchema,
  timestamp: TimestampSchema,
  sender: UsernameSchema
});
