import { z } from "zod";
import { LocationSchema } from "@/controller/schema/Common.mjs";

export const PutRequestSchema = z.object({
  location: LocationSchema
});

export const PutResponseSchema = z.object({});

export const GetRequestSchema = z.object({});

export const GetResponseSchema = z.object({
  location: LocationSchema
});
