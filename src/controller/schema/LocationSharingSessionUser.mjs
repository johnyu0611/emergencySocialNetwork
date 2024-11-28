import { z } from "zod";
import {
  LocationSchema,
  LocationSharingLastSeenSchema,
  LocationSharingResourceListSchema,
  LocationSharingRoleSchema,
  UsernameSchema
} from "@/controller/schema/Common.mjs";

export const GetRequestSchema = z.object({});

export const GetResponseSchema = z.object({
  users: z.array(
    z.object({
      username: UsernameSchema,
      role: LocationSharingRoleSchema,
      location: LocationSchema,
      lastSeen: LocationSharingLastSeenSchema,
      resourceRequest: LocationSharingResourceListSchema,
      resourceResponse: LocationSharingResourceListSchema
    })
  )
});

export const PostRequestSchema = z.object({
  location: LocationSchema
});

export const PostResponseSchema = z.object({});
