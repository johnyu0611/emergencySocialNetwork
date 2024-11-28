import { Banner } from "./common/banner.mjs";
import { KEY_TOKEN } from "./common/constants.mjs";
import { postQuiz } from "./lib/postQuiz.mjs";
import {
  ENDPOINT_SOCKET_IO,
  NAMESPACE_SOCKET_IO_SYSTEM,
  NAMESPACE_SOCKET_IO_CHATROOM
} from "./lib/endpoints.mjs";
import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";
import { validateQuizDescription } from "./lib/validate-quiz-description.mjs";

const banner = new Banner($("#banner"));
const $buttonCancel = $("#button-cancel");
const $buttonConfirm = $("#button-confirm");

function onCancel() {
  window.location.href = "directory.html";
}

async function onConfirm(event) {
  event.preventDefault();

  const description = $("#description").val();
  const answer = $("input[name='answer']:checked").val();

  if (!description || !answer) {
    alert("Please fill out both the description and answer!");
    return;
  }

  if (!validateQuizDescription(description)) {
    alert(
      "Description should be between 10 and 300 characters. Also cannot only contain whitespace, digits, or special characters!"
    );
    return;
  }

  try {
    const token = localStorage.getItem(KEY_TOKEN);
    const payload = { description, answer: answer === "true" };
    const response = await postQuiz({ payload, token });
    if (response.success) {
      // alert(response.message);
      void banner.showSuccessMessage(response.message);
      $("#description").val("");
      $("input[name='answer']:checked").prop("checked", false);
    } else {
      alert("Failed to submit quiz: " + response.message);
    }
  } catch (error) {
    alert("wrong");
    console.error(error);
  }
}

$(document).ready(() => {
  const socket = io(NAMESPACE_SOCKET_IO_SYSTEM, {
    path: ENDPOINT_SOCKET_IO,
    auth: {
      token: localStorage.getItem(KEY_TOKEN)
    }
  });

  $buttonCancel.click(onCancel);
  $buttonConfirm.click(onConfirm);
});
