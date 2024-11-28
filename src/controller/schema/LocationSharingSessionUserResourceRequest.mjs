import { z } from "zod";
import { LocationSharingResourceListSchema } from "@/controller/schema/Common.mjs";

export const PutRequestSchema = z.object({
  resourceRequest: LocationSharingResourceListSchema
});

export const PutResponseSchema = z.object({});

export const GetRequestSchema = z.object({});

export const GetResponseSchema = z.object({
  resourceRequest: LocationSharingResourceListSchema
});
