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
  .regex(/^[a-zA-Z0-9]+$/u, {
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

export const IntroductionSchema = z.string();

export const TitleSchema = z
  .string()
  .trim()
  .min(4, { message: "Title should be at least 4 characters long" })
  .max(50, { message: "Title exceeded maximum length limit" })
  .refine((username) => !bannedUsernameSet.has(username), {
    message: "Title should not be a banned name"
  });

// Added for speed test
export const StateSchema = z.union([
  z.literal("normal"),
  z.literal("performanceTest")
]);

export const StatusSchema = z.string({ message: "status should be a string" });

export const LocationSharingSessionIdSchema = z.union([
  z.string().uuid(),
  z.literal("undefined")
]);

export const LocationSharingRoleSchema = z.union([
  z.literal("initiator"),
  z.literal("responder"),
  z.literal("undefined")
]);

export const LocationSharingLastSeenSchema = z.number();

export const LocationSharingResourceListSchema = z.array(z.string().min(1));

export const ResourceIdSchema = z.string().uuid();

export const LocationSchema = z.object({
  latitude: z
    .number({ message: "Latitude must be a number" })
    .min(-90, { message: "Latitude must be greater than or equal to -90" })
    .max(90, { message: "Latitude must be less than or equal to 90" }),
  longitude: z
    .number({ message: "Longitude must be a number" })
    .min(-180, { message: "Longitude must be greater than or equal to -180" })
    .max(180, { message: "Longitude must be less than or equal to 180" })
});

export const MCIdSchema = z.string().uuid();

export const AddressSchema = z.string();

export const IsuserSchema = z.boolean();

export const ContentSchema = z.string();

export const RateSchema = z
  .number({ message: "Rate must be a number" })
  .int({ message: "Rate must be a Integer" })
  .min(1, { message: "Rate must be equal or larger than 1" })
  .max(5, { message: "Rate must be equal or less than 5" });

// For quizzes
export const DescriptionSchema = z
  .string({
    message: "Description should be a string"
  })
  .trim()
  .min(1, { message: "Description cannot be empty" })
  .max(256, { message: "Description exceeded maximum length limit" });

export const AnswerSchema = z.boolean({
  message: "Answer must be a boolean (true/false)"
});

export const UserIdSchema = z.number("UserId must be a number");
