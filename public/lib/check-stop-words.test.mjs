import { checkStopWords } from "./check-stop-words.mjs";
import { describe, expect, test } from "@jest/globals";

describe("Test the Stop Word Rule", () => {
  test("should return true if input is a Stop Word", async () => {
    const input = "a";
    expect(checkStopWords(input)).toBe(true);
  });

  test("should return false if input is not a Stop Word", async () => {
    const input = "fantastic";
    expect(checkStopWords(input)).toBe(false);
  });
});
