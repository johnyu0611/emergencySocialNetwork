import { validateTitle } from "@/util/ValidateTitle.mjs";
import { validateLocation } from "@/util/ValidateLocation.mjs";
import { ZodError } from "zod";
import { describe, expect, test } from "@jest/globals";
import { validateRate } from "@/util/ValidateRate.mjs";

describe("Test Title Rules", () => {
  test("should throw error if title is less than 4 characters", async () => {
    const title = "ab";

    expect(() => validateTitle(title)).toThrow(ZodError);
    try {
      validateTitle(title);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Title should be at least 4 characters long"
      );
    }
  });

  test("should throw error if title is greater than 50 characters", async () => {
    const title =
      "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";

    expect(() => validateTitle(title)).toThrow(ZodError);
    try {
      validateTitle(title);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Title exceeded maximum length limit"
      );
    }
  });

  test("should throw error if title is a banned name -- admin", async () => {
    const title = "admin";

    expect(() => validateTitle(title)).toThrow(ZodError);
    try {
      validateTitle(title);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe("Title should not be a banned name");
    }
  });

  test("should validate successfully if title is valid", () => {
    const title = "user123";
    expect(() => validateTitle(title)).not.toThrow();

    const result = validateTitle(title);
    expect(result).toBe(title);
  });

  test("should throw error for latitude less than -90", () => {
    const invalidLocation = { latitude: -91, longitude: 90 };

    expect(() => validateLocation(invalidLocation)).toThrow(ZodError);

    try {
      validateLocation(invalidLocation);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Latitude must be greater than or equal to -90"
      );
    }
  });

  test("should throw error for longitude larger than 180", () => {
    const invalidLocation = { latitude: -89, longitude: 182 };

    expect(() => validateLocation(invalidLocation)).toThrow(ZodError);

    try {
      validateLocation(invalidLocation);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Longitude must be less than or equal to 180"
      );
    }
  });

  test("should validate successfully with valid latitude and longitude", () => {
    const valid = { latitude: 45, longitude: 90 };

    expect(() => validateLocation(valid)).not.toThrow();

    const result = validateLocation(valid);
    expect(result).toEqual(valid);
  });

  test("should throw error if rate is not number", () => {
    const rate = "a";

    expect(() => validateRate(rate)).toThrow(ZodError);

    try {
      validateRate(rate);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe("Rate must be a number");
    }
  });

  test("should throw error if rate is not integer", () => {
    const rate = 1.2;

    expect(() => validateRate(rate)).toThrow(ZodError);

    try {
      validateRate(rate);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe("Rate must be a Integer");
    }
  });

  test("should validate successfully with valid rate", () => {
    const valid = 2;

    expect(() => validateRate(valid)).not.toThrow();

    const result = validateRate(valid);
    expect(result).toEqual(valid);
  });

  test("should throw error if rate is less than 1", () => {
    const rate = 0;

    expect(() => validateRate(rate)).toThrow(ZodError);

    try {
      validateRate(rate);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Rate must be equal or larger than 1"
      );
    }
  });

  test("should throw error if rate is larger than 5", () => {
    const rate = 6;

    expect(() => validateRate(rate)).toThrow(ZodError);

    try {
      validateRate(rate);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe("Rate must be equal or less than 5");
    }
  });
});
