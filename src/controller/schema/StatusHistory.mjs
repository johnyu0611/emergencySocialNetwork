import { z } from "zod";
import { TimestampSchema } from "@/controller/schema/Common.mjs";

const StatusHistoryEntrySchema = z.object({
  sender: z.string(),
  status: z.enum(["OK", "Help", "Emergency"]),
  timestamp: TimestampSchema
});

export const StatusHistoryGetRequestSchema = z.object({
  roomId: z.string().nonempty("Room ID is required")
});

export const StatusHistoryGetResponseSchema = z.array(StatusHistoryEntrySchema);
