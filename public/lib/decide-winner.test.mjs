import { decideWinner } from "./decide-winner.mjs";
import { describe, expect, test } from "@jest/globals";

describe("Test the Quiz Description Validation", () => {
  test("should give the result of 'It is a draw!' when both users made the correct choice", async () => {
    const currentUserResult = "correct";
    const opponentResult = "correct";
    expect(decideWinner(currentUserResult, opponentResult)).toBe(
      "It is a draw!"
    );
  });

  test("should give the result of 'It is a draw!' when both users made the wrong choice", async () => {
    const currentUserResult = "wrong";
    const opponentResult = "wrong";
    expect(decideWinner(currentUserResult, opponentResult)).toBe(
      "It is a draw!"
    );
  });

  test("should give the result of 'You win :)' when both this user makes correct answer and the opponent makes the wrong choice", async () => {
    const currentUserResult = "correct";
    const opponentResult = "wrong";
    expect(decideWinner(currentUserResult, opponentResult)).toBe("You win :)");
  });

  test("should give the result of 'You lose :(' when both this user makes wrong choice and the opponent makes the correct choice", async () => {
    const currentUserResult = "wrong";
    const opponentResult = "correct";
    expect(decideWinner(currentUserResult, opponentResult)).toBe("You lose :(");
  });
});
