import { TitleSchema } from "@/controller/schema/Common.mjs";

export function validateTitle(title) {
  return TitleSchema.parse(title);
}
