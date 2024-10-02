import { Banner } from "./common/banner.mjs";
import { KEY_TOKEN } from "./common/constants.mjs";
import { sleep } from "./common/utils.mjs";
import {
  ENDPOINT_SOCKET_IO,
  NAMESPACE_SOCKET_IO_CONNECTED
} from "./lib/endpoints.mjs";
import { getESNDirectory } from "./lib/get-esndirectory.mjs";
import { logout } from "./lib/logout.mjs";
import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";

const banner = new Banner($("#banner"));
const $buttonLogout = $("#button-logout");

async function onPost() {
  try {
    await sleep(50);
    const token = localStorage.getItem(KEY_TOKEN);
    const response = await getESNDirectory({ token });
    const users = response.users;
    displayUsers(users);
  } catch (e) {
    console.error(e);
  }
}

function displayUsers(users) {
  const userList = document.getElementById("user-list");
  userList.innerHTML = "";
  const sortedUsers = users.sort((a, b) => {
    if (a.status === "online" && b.status === "offline") return -1;
    if (a.status === "offline" && b.status === "online") return 1;
    // If both users have the same status, sort alphabetically
    return a.username.localeCompare(b.username);
  });

  sortedUsers.forEach((user) => {
    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item");
    listItem.style.display = "flex";
    listItem.style.justifyContent = "space-between";
    listItem.style.alignItems = "center";
    listItem.style.color = user.status === "online" ? "green" : "grey";

    // Create a span for the username
    const usernameSpan = document.createElement("span");
    usernameSpan.textContent = user.username;

    // Create a span for the status dot
    const statusDot = document.createElement("span");
    statusDot.style.height = "10px";
    statusDot.style.width = "10px";
    statusDot.style.borderRadius = "50%";
    statusDot.style.display = "inline-block";
    statusDot.style.backgroundColor =
      user.status === "online" ? "green" : "grey";

    // Append the username and status dot to the list item
    listItem.appendChild(usernameSpan);
    listItem.appendChild(statusDot);
    userList.appendChild(listItem);
  });
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

async function onSocketIOReloadPage() {
  await onPost();
}

async function onSocketIOConnect() {
  void banner.showSuccessMessage("Connected");
}

async function onSocketIOConnectError(error) {
  console.error(error);
  // From https://socket.io/docs/v4/client-socket-instance/#connect_error
  if (socket.active) {
    // Temporary failure, the socket will automatically try to reconnect
    await banner.showWarningMessage(
      "Cannot establish connection to server, retrying...",
      error.message
    );
  } else {
    // The connection was denied by the server
    // In that case, `socket.connect()` must be manually called in order to reconnect
    await banner.showErrorMessage(
      "Server rejected the connection, please log in again",
      error.message
    );
  }
}

$(document).ready(async () => {
  $buttonLogout.click(onLogout);
  const socket = io(NAMESPACE_SOCKET_IO_CONNECTED, {
    path: ENDPOINT_SOCKET_IO,
    auth: {
      token: localStorage.getItem(KEY_TOKEN)
    }
  });

  socket.on("connect", onSocketIOConnect);
  socket.on("connect_error", onSocketIOConnectError);
  socket.on("join", onSocketIOReloadPage);
  socket.on("leave", onSocketIOReloadPage);

  await onPost();
});
