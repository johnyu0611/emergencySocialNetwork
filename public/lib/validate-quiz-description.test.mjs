import { validateQuizDescription } from "./validate-quiz-description.mjs";
import { describe, expect, test } from "@jest/globals";

describe("Test the Quiz Description Validation", () => {
  test("should return true if the given description is between 10 and 300 words. Also it doesn't only contain whitespace or digits", async () => {
    const input = "Sample question";
    expect(validateQuizDescription(input)).toBe(true);
  });

  test("should return false if description is less than 10 characters", async () => {
    const input = "happy";
    expect(validateQuizDescription(input)).toBe(false);
  });

  test("should return false if description is more than 300 characters", async () => {
    const input =
      "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";
    expect(validateQuizDescription(input)).toBe(false);
  });

  test("should return false if description has length between 10 and 300 but only containing whitespaces", async () => {
    const input = "                    ";
    expect(validateQuizDescription(input)).toBe(false);
  });

  test("should return false if description has length between 10 and 300 but only containing digits", async () => {
    const input = "1234567890123";
    expect(validateQuizDescription(input)).toBe(false);
  });

  test("should return false if description has length between 10 and 300 but only containing special characters", async () => {
    const input = "@#%$@*$$^*#$&^)$";
    expect(validateQuizDescription(input)).toBe(false);
  });
});
