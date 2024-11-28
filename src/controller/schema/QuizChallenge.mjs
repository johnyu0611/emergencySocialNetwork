import { UsernameSchema } from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `POST /api/quizzes/challenges`
 *
 * Request payload schema
 */
export const PostRequestSchema = z.object({
  challenger: UsernameSchema,
  challenged: UsernameSchema
});

/**
 * `POST /api/quizzes/challenges`
 *
 * Response payload schema
 */
export const PostResponseSchema = z.object({
  message: z.string(),
  questionID: z.number()
});

/**
 * `PUT /api/quizzes/challenges`
 *
 * Request payload schema
 */
export const PutRequestSchema = z.object({
  challenger: UsernameSchema,
  challenged: UsernameSchema,
  questionID: z.number()
});
