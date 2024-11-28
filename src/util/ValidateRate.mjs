import { RateSchema } from "@/controller/schema/Common.mjs";

export function validateRate(rate) {
  return RateSchema.parse(rate);
}
