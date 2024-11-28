import { z } from "zod";
import { LocationSharingLastSeenSchema } from "@/controller/schema/Common.mjs";

export const PutRequestSchema = z.object({
  lastSeen: LocationSharingLastSeenSchema
});

export const PutResponseSchema = z.object({});

export const GetRequestSchema = z.object({});

export const GetResponseSchema = z.object({
  lastSeen: LocationSharingLastSeenSchema
});
