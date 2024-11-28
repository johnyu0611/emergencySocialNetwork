export function decideWinner(currentUserResult, opponentResult) {
  if (currentUserResult === "correct" && opponentResult === "wrong") {
    return "You win :)";
  } else if (currentUserResult === "wrong" && opponentResult === "correct") {
    return "You lose :(";
  } else {
    return "It is a draw!";
  }
}
