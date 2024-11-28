import {
  LocationSchema,
  TitleSchema,
  IntroductionSchema,
  MCIdSchema,
  AddressSchema,
  IsuserSchema
} from "@/controller/schema/Common.mjs";
import { z } from "zod";

/**
 * `POST /api/medicalcenters`
 *
 * Request payload schema
 */
export const PostRequestSchema = z.object({
  location: LocationSchema,
  title: TitleSchema,
  introduction: IntroductionSchema,
  address: AddressSchema
});

/**
 * `POST /api/medicalcenters`
 *
 * Response payload schema
 */
export const PostResponseSchema = z.object({});

/**
 * `GET /api/medicalcenters`
 *
 * Request payload schema
 */
export const GetRequestSchema = z.object({});

/**
 * `GET /api/users`
 *
 * Response payload schema
 */
export const GetResponseSchema = z.object({
  medicalcenters: z.array(
    z.object({
      mcId: MCIdSchema,
      location: LocationSchema,
      title: TitleSchema,
      introduction: IntroductionSchema,
      address: AddressSchema,
      isUser: IsuserSchema
    })
  )
});

export const DeleteRequestSchema = z.object({
  mcId: MCIdSchema
});

export const DeleteResponseSchema = z.object({
  id: MCIdSchema
});

export const PutRequestSchema = z.object({
  introduction: IntroductionSchema,
  mcId: MCIdSchema
});

export const PutResponseSchema = z.object({
  id: MCIdSchema
});
