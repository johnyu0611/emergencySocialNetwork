import { LocationSchema } from "@/controller/schema/Common.mjs";

export function validateLocation(location) {
  return LocationSchema.parse(location);
}
