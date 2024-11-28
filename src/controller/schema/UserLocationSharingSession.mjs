import { z } from "zod";
import { LocationSharingSessionIdSchema } from "@/controller/schema/Common.mjs";

export const PutRequestSchema = z.object({
  id: LocationSharingSessionIdSchema
});

export const PutResponseSchema = z.object({});

export const GetRequestSchema = z.object({});

export const GetResponseSchema = z.object({
  id: LocationSharingSessionIdSchema
});
