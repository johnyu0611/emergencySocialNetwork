import { Banner } from "./common/banner.mjs";
import { KEY_TOKEN } from "./common/constants.mjs";
import { getQuestionByID } from "./lib/getQuestionById.mjs";
import { submitAnswer } from "./lib/submitAnswer.mjs";
import {
  ENDPOINT_SOCKET_IO,
  NAMESPACE_SOCKET_IO_SYSTEM,
  NAMESPACE_SOCKET_IO_CHATROOM
} from "./lib/endpoints.mjs";
import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";
import { getJWTPayload } from "./common/utils.mjs";
import { getUsernameById } from "./lib/get-username.mjs";
import { decideWinner } from "./lib/decide-winner.mjs";

await fetchComponents();

const banner = new Banner($("#banner"));
const resultModal = new bootstrap.Modal(
  document.getElementById("modal-quiz-result")
);

$(document).ready(async () => {
  const socket = io(NAMESPACE_SOCKET_IO_SYSTEM, {
    path: ENDPOINT_SOCKET_IO,
    auth: {
      token: localStorage.getItem(KEY_TOKEN)
    }
  });

  socket.on("result_available", async (data) => {
    const { results, questionID, participants } = data;

    const token = localStorage.getItem(KEY_TOKEN);
    const { userId } = getJWTPayload(token);
    const { username: currentUsername } = await getUsernameById({
      userId,
      token
    });

    if (participants.includes(currentUsername)) {
      const resultMessages = Object.entries(results)
        .map(([username, result]) => `${username}: ${result}`)
        .join("<br>");

      console.log(results);
      const currentUserResult = results[currentUsername];
      const opponent = participants.find(
        (participant) => participant !== currentUsername
      );
      const opponentResult = results[opponent];

      const additionalMessage = decideWinner(currentUserResult, opponentResult);

      document.getElementById("quiz-result-message").innerHTML =
        `${resultMessages}<br><br>${additionalMessage}`;

      resultModal.show();
    }
  });

  $(document).on("click", "#finishButton", () => {
    window.location.href = "directory.html";
  });

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const questionID = urlParams.get("questionID");
    const challenger = localStorage.getItem("currentChallengeChallenger");
    const challenged = localStorage.getItem("currentChallengeChallenged");

    if (!questionID || !challenger || !challenged) {
      console.error("Missing necessary challenge details.");
      return;
    }

    const token = localStorage.getItem(KEY_TOKEN);
    const question = await getQuestionByID({ questionID, token });

    displayQuestion(question);
  } catch (error) {
    console.error("Failed to load the question:", error);
    $("#question-container").html(
      `<p>Error loading question. Please try again later.</p>`
    );
  }
});

function displayQuestion(question) {
  const container = $("#question-container");

  container.html(`
    <h3 style="text-align: center; font-size: 1.2rem; font-weight: bold;">
      ${question.description}
    </h3>
    <div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px;">
      <label style="font-size: 1.2rem;">
        <input type="radio" name="answer" value="true" style="transform: scale(1.5); margin-right: 8px;"> True
      </label>
      <label style="font-size: 1.2rem;">
        <input type="radio" name="answer" value="false" style="transform: scale(1.5); margin-right: 8px;"> False
      </label>
    </div>
    <div style="display: flex; justify-content: center; margin-top: 20px;">
      <button id="submit-answer" 
        style="
          background-color: green; 
          color: white; 
          border: none; 
          padding: 10px 20px; 
          border-radius: 4px; 
          cursor: pointer; 
          font-size: 1rem; 
          transition: background-color 0.3s ease;"
      >
        Submit
      </button>
    </div>
  `);

  $("#submit-answer").hover(
    function () {
      $(this).css("background-color", "darkgreen");
    },
    function () {
      $(this).css("background-color", "green");
    }
  );

  $("#submit-answer").on("click", async () => {
    const selectedAnswer = $("input[name='answer']:checked").val();
    if (selectedAnswer == null) {
      alert("Please select an answer before submitting!");
      return;
    }

    try {
      $("#submit-answer").css("visibility", "hidden");
      $("input[name='answer']").closest("div").css("visibility", "hidden");
      void banner.showSuccessMessage("Submitted!");

      const urlParams = new URLSearchParams(window.location.search);
      const questionID = urlParams.get("questionID");

      if (!questionID) {
        throw new Error("Question ID is missing from the URL.");
      }
      const token = localStorage.getItem(KEY_TOKEN);
      const challenger = localStorage.getItem("currentChallengeChallenger");
      const challenged = localStorage.getItem("currentChallengeChallenged");

      const payload = {
        questionID: parseInt(questionID),
        challenger,
        challenged,
        answer: selectedAnswer === "true"
      };

      await submitAnswer({ payload, token });
    } catch (error) {
      console.error("Failed to submit answer:", error);
      alert("Failed to submit your answer. Please try again.");
    }
  });
}
