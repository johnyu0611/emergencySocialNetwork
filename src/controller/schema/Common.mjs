import { z } from "zod";
import { bannedUsernameSet } from "@/util/BannedUsername.mjs";

export const UsernameSchema = z
  .string({
    message: "Username should be a string"
  })
  .trim()
  .toLowerCase()
  .min(3, { message: "Username should be at least 3 characters long" })
  .max(32, { message: "Username exceeded maximum length limit" })
  .regex(/^[a-z0-9]+$/u, {
    message: "Username contains illegal characters"
  })
  .refine((username) => !bannedUsernameSet.has(username), {
    message: "Username should not be a banned name"
  });

export const PasswordSchema = z
  .string({
    message: "Password should be a string"
  })
  .trim()
  .min(4, { message: "Password should be at least 4 characters long" })
  .max(64, { message: "Password exceeded maximum length limit" })
  .regex(/^[ -~]+$/u, {
    message: "Password contains illegal characters"
  });

export const TokenSchema = z
  .string({ message: "Token must be a string" })
  .trim()
  .min(1, { message: "Token cannot be empty" });

export const ChatroomIdSchema = z.string().uuid();
export const ChatroomTitleSchema = z.string();
export const MessageIdSchema = z.string().uuid();
export const MessageContentSchema = z.string();
export const HasUnreadSchema = z.boolean();

export const TimestampSchema = z.date();

export const ErrorReasonSchema = z
  .string({ message: "Error reason must be a string" })
  .trim()
  .min(1, { message: "Error reason cannot be empty" });

export const IsOnlineSchema = z.boolean();

// Added for speed test
export const StateSchema = z.union([
  z.literal("normal"),
  z.literal("performanceTest")
]);

export const StatusSchema = z.string({ message: "status should be a string" });
