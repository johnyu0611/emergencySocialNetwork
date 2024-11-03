import { UsernameSchema } from "@/controller/schema/Common.mjs";

export function validateUsername(username) {
  return UsernameSchema.parse(username);
}
