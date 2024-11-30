import { UserIdSchema } from "@/controller/schema/Common.mjs";
import { z } from "zod";

export const AuthPayloadSchema = z.object({
  userId: UserIdSchema
});
