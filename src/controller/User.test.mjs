import { validateUsername } from "@/util/ValidateUsername.mjs";
import { validatePassword } from "@/util/ValidatePassword.mjs";
import { ZodError } from "zod";
import { describe, expect, test } from "@jest/globals";

describe("Test Username & Password Rules", () => {
  test("should throw error if username is less than 3 characters", async () => {
    const username = "ab";

    expect(() => validateUsername(username)).toThrow(ZodError);
    try {
      validateUsername(username);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Username should be at least 3 characters long"
      );
    }
  });

  test("should throw error if username is greater than 32 characters", async () => {
    const username = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";

    expect(() => validateUsername(username)).toThrow(ZodError);
    try {
      validateUsername(username);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Username exceeded maximum length limit"
      );
    }
  });

  test("should throw error if username is a banned name -- admin", async () => {
    const username = "admin";

    expect(() => validateUsername(username)).toThrow(ZodError);
    try {
      validateUsername(username);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Username should not be a banned name"
      );
    }
  });

  test("should throw error if username is a banned name -- directory", async () => {
    const username = "directory";

    expect(() => validateUsername(username)).toThrow(ZodError);
    try {
      validateUsername(username);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Username should not be a banned name"
      );
    }
  });

  test("should throw error if username contains other than letters and numbers", async () => {
    const username = "abcd@";

    expect(() => validateUsername(username)).toThrow(ZodError);
    try {
      validateUsername(username);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Username contains illegal characters"
      );
    }
  });

  test("should return the same username even they have difference cases", async () => {
    const username1 = "abcd";
    const username2 = "ABCD";

    expect(validateUsername(username1)).toBe(validateUsername(username2));
  });

  test("should throw error if password is less than 4 characters", async () => {
    const password = "ab";

    expect(() => validatePassword(password)).toThrow(ZodError);
    try {
      validatePassword(password);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Password should be at least 4 characters long"
      );
    }
  });

  test("should throw error if password is greater than 64 characters", async () => {
    const password =
      "123456781234567812345678123456781234567812345678123456781234567812345678";

    expect(() => validatePassword(password)).toThrow(ZodError);
    try {
      validatePassword(password);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Password exceeded maximum length limit"
      );
    }
  });

  test("should throw error if password contain non-printable ASCII characters", async () => {
    const password = "123™";

    expect(() => validatePassword(password)).toThrow(ZodError);
    try {
      validatePassword(password);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Password contains illegal characters"
      );
    }
  });

  test("should not be equal when two strings have different cases", async () => {
    const password1 = "abcd";
    const password2 = "ABCD";

    expect(validatePassword(password1)).not.toBe(validatePassword(password2));
  });
});
