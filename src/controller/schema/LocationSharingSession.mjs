import { z } from "zod";
import {
  LocationSchema,
  LocationSharingSessionIdSchema
} from "@/controller/schema/Common.mjs";

export const PostRequestSchema = z.object({
  location: LocationSchema
});

export const PostResponseSchema = z.object({
  id: LocationSharingSessionIdSchema
});
