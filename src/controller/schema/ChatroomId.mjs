import { UsernameSchema } from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `GET /api/chatrooms/:chatroomId`
 *
 * Request payload schema
 */
export const GetRequestSchema = z.object({});

/**
 * `GET /api/chatrooms/:chatroomId`
 *
 * Response payload schema
 */
export const GetResponseSchema = z.object({
  title: z.string(),
  users: z.array(
    z.object({
      username: UsernameSchema
    })
  )
});
