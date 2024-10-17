import { Banner } from "./common/banner.mjs";
import { KEY_TOKEN } from "./common/constants.mjs";
import { parseQueryParameters } from "./common/parse-query-parameters.mjs";
import {
  ENDPOINT_SOCKET_IO,
  NAMESPACE_SOCKET_IO_CHATROOM,
  NAMESPACE_SOCKET_IO_CONNECTED
} from "./lib/endpoints.mjs";
import { getHistoryMessages } from "./lib/get-history-messages.mjs";
import { logout } from "./lib/logout.mjs";
import { postMessage } from "./lib/post-message.mjs";
import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";

const banner = new Banner($("#banner"));
const $inputBox = $("#input-box");
const $buttonPost = $("#button-post");
const $buttonLogout = $("#button-logout");
const $chatHistoryContainer = $("#chat-history-container");
let roomId = undefined;

function messageBox(username, timestampMillis, message, status) {
  const time = new Date(timestampMillis).toLocaleString();
  const box = $(`
        <div class="message-box">
            <div class="metadata">
                <div class="user">
                  <span class="username"></span>
                  <span class="status"></span>
                </div>
                <div class="time"></div>
            </div>
            <div class="message"></div>
        </div>
    `);
  // To eliminate XSS
  box.find("div.user").find("span.username").text(username);
  box.find("div.user").find("span.status").text(` (${status})`);
  box.find("div.time").text(time);
  box.find("div.message").text(message);
  return box;
}

function postLogout() {
  localStorage.removeItem(KEY_TOKEN);
  location.href = "index.html";
}

async function onLogout() {
  banner.reset();
  $buttonLogout.prop("disabled", true);

  const token = localStorage.getItem(KEY_TOKEN);
  try {
    await logout({ token });
  } catch (e) {
    console.error(e);
  }

  postLogout();
}

async function onPost() {
  try {
    banner.reset();
    $buttonPost.prop("disabled", true);

    const token = localStorage.getItem(KEY_TOKEN);

    const message = $inputBox.val();
    if (!message || message.length === 0) {
      throw new Error("Please input a message");
    }

    await postMessage({ roomId, token, content: message });
    $inputBox.val("");
  } catch (e) {
    void banner.showError(e);
    console.error(e);
  } finally {
    $buttonPost.prop("disabled", false);
  }
}

function onSocketIOMessage(socketIOMessage) {
  const scroll =
    $chatHistoryContainer.scrollTop() + $chatHistoryContainer.innerHeight() >=
    $chatHistoryContainer.prop("scrollHeight") - 1;
  const { author, content, timestamp } = socketIOMessage;
  $chatHistoryContainer.append(
    messageBox(author, timestamp, content, "Registered")
  );
  if (scroll) {
    $chatHistoryContainer.scrollTop($chatHistoryContainer.prop("scrollHeight"));
  }
}

async function onSocketIOConnect() {
  void banner.showSuccessMessage("Connected");
  $chatHistoryContainer.empty();
  await populateHistoryMessages();
}

function onSocketIOConnectError(socket) {
  return async function (error) {
    console.error(error);
    // From https://socket.io/docs/v4/client-socket-instance/#connect_error
    if (socket.active) {
      // Temporary failure, the socket will automatically try to reconnect
      void banner.showWarningMessage(
        "Cannot establish connection to server, retrying..."
      );
    } else {
      // The connection was denied by the server
      // In that case, `socket.connect()` must be manually called in order to reconnect
      void banner.showErrorMessage(
        "Server rejected the connection, please log in again"
      );
    }
  };
}

async function populateHistoryMessages() {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }

  try {
    const { messages } = await getHistoryMessages({ token, roomId });
    $chatHistoryContainer.append(
      messages.map((e) =>
        messageBox(e.author, e.timestamp, e.content, "Registered")
      )
    );
    $chatHistoryContainer.scrollTop($chatHistoryContainer.prop("scrollHeight"));
  } catch (error) {
    console.error(error);
  }
}

// async function populateHistoryMessages(anchorMessageId) {
//   if (anchorMessageId < 2) {
//     return anchorMessageId;
//   }
//
//   const token = localStorage.getItem(KEY_TOKEN);
//   const { chatRecords } = await getChatRecords({
//     token,
//     count: CHAT_RECORD_LOAD_COUNT,
//     anchorMessageId
//   });
//
//   const previousScrollHeight = $chatHistoryContainer.prop("scrollHeight");
//   $chatHistoryContainer.prepend(
//     chatRecords.map(({ username, timestamp, message }) =>
//       messageBox(username, timestamp, message)
//     )
//   );
//   const currentScrollHeight = $chatHistoryContainer.prop("scrollHeight");
//   $chatHistoryContainer.scrollTop(
//     (_, previousScrollTop) =>
//       previousScrollTop + currentScrollHeight - previousScrollHeight
//   );
//
//   return chatRecords[0].id;
// }

$(document).ready(async () => {
  $buttonLogout.click(onLogout);
  $buttonPost.click(onPost);

  roomId = parseQueryParameters(location.href).roomId;

  const socketChatroom = io(NAMESPACE_SOCKET_IO_CHATROOM, {
    path: ENDPOINT_SOCKET_IO,
    query: {
      roomId
    },
    auth: {
      token: localStorage.getItem(KEY_TOKEN)
    }
  });

  io(NAMESPACE_SOCKET_IO_CONNECTED, {
    path: ENDPOINT_SOCKET_IO,
    auth: {
      token: localStorage.getItem(KEY_TOKEN)
    }
  });

  socketChatroom.on("connect", onSocketIOConnect);
  socketChatroom.on("connect_error", onSocketIOConnectError(socketChatroom));
  socketChatroom.on("message", onSocketIOMessage);
});
