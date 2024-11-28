import {
  DescriptionSchema,
  AnswerSchema,
  UsernameSchema
} from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `POST /api/quizzes`
 *
 * Request payload schema
 */
export const PostRequestSchema = z.object({
  creator: UsernameSchema,
  description: DescriptionSchema,
  answer: AnswerSchema
});

/**
 * `POST /api/quizzes`
 *
 * Response payload schema
 */
export const PostResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});
