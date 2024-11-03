import { PasswordSchema } from "@/controller/schema/Common.mjs";

export function validatePassword(password) {
  return PasswordSchema.parse(password);
}
