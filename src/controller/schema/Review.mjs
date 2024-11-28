import {
  MCIdSchema,
  ContentSchema,
  RateSchema,
  TimestampSchema,
  UsernameSchema,
  LocationSchema,
  TitleSchema,
  IntroductionSchema,
  AddressSchema
} from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `POST /api/reviews`
 *
 * Request payload schema
 */
export const PostRequestSchema = z.object({
  content: ContentSchema,
  rate: RateSchema,
  mcId: MCIdSchema
});

/**
 * `POST /api/reviews`
 *
 * Response payload schema
 */
export const PostResponseSchema = z.object({});

/**
 * `GET /api/reviews`
 *
 * Request payload schema
 */
export const GetRequestSchema = z.object({
  mcId: MCIdSchema
});

/**
 * `GET /api/reviews`
 *
 * Response payload schema
 */
export const GetResponseSchema = z.object({
  reviews: z.array(
    z.object({
      content: ContentSchema,
      rate: RateSchema,
      mcId: MCIdSchema,
      timestamp: TimestampSchema,
      author: UsernameSchema
    })
  ),
  mc: z.object({
    mcId: MCIdSchema,
    location: LocationSchema,
    title: TitleSchema,
    introduction: IntroductionSchema,
    address: AddressSchema
  }),
  rate: z.number()
});
