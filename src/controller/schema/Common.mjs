import { z } from "zod";

export const UsernameSchema = z
  .string({ message: "Username should be a string" })
  .trim()
  .min(3, { message: "Username should be at least 3 characters long" })
  .max(32, { message: "Username exceeded maximum length limit" })
  .regex(/^[a-z0-9]+$/u, {
    message:
      "Username contains illegal characters. Only lowercase letters and numbers are accepted"
  });

export const PasswordSchema = z
  .string({ message: "Password should be a string" })
  .trim()
  .min(4, { message: "Password should be at least 4 characters long" })
  .max(64, { message: "Password exceeded maximum length limit" })
  .regex(/^[ -~]+$/u, {
    message:
      "Password contains illegal characters. Only printable ASCII characters are accepted"
  });

export const TokenSchema = z
  .string({ message: "Token must be a string" })
  .trim()
  .min(1, { message: "Token cannot be empty" });

export const ErrorReasonSchema = z
  .string({ message: "Error reason must be a string" })
  .trim()
  .min(1, { message: "Error reason cannot be empty" });
