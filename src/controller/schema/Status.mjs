import { z } from "zod";

export const StatusRequestSchema = z.object({
  status: z.enum(["OK", "Help", "Emergency"], {
    message: "Invalid status. Must be 'OK', 'Help', or 'Emergency'."
  })
});

export const StatusResponseSchema = z.object({
  status: z.string()
});

export const StatusGetRequestSchema = z.object({
  username: z.string()
});

export const StatusGetResponseSchema = z.object({
  status: z.string()
});
