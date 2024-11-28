import { z } from "zod";
import { LocationSharingRoleSchema } from "@/controller/schema/Common.mjs";

export const PutRequestSchema = z.object({
  role: LocationSharingRoleSchema
});

export const PutResponseSchema = z.object({});

export const GetRequestSchema = z.object({});

export const GetResponseSchema = z.object({
  role: LocationSharingRoleSchema
});
