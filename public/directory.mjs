import { Banner } from "./common/banner.mjs";
import { KEY_TOKEN } from "./common/constants.mjs";
import { sleep } from "./common/utils.mjs";
import {
  ENDPOINT_SOCKET_IO,
  NAMESPACE_SOCKET_IO_SYSTEM
} from "./lib/endpoints.mjs";
import { getESNDirectory } from "./lib/get-esndirectory.mjs";
import { logout } from "./lib/logout.mjs";
import { updateStatus as apiUpdateStatus } from "./lib/change-status.mjs";
import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";

const banner = new Banner($("#banner"));
const $buttonLogout = $("#button-logout");
const $statusButton = $("#share-status");
const statusModal = new bootstrap.Modal($("#modal-status"));
const modalBody = $("#modal-status .modal-body");

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
    if (a.isOnline === true && b.isOnline === false) {
      return -1;
    }
    if (a.isOnline === false && b.isOnline === true) {
      return 1;
    }
    // If both users have the same status, sort alphabetically
    return a.username.localeCompare(b.userame);
  });

  sortedUsers.forEach((user) => {
    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item");
    listItem.style.display = "flex";
    listItem.style.justifyContent = "space-between";
    listItem.style.alignItems = "center";
    listItem.style.color = user.isOnline === true ? "green" : "grey";

    // Create a span for the username
    const usernameSpan = document.createElement("span");
    usernameSpan.textContent = user.username;

    // Create a span for the status dot
    const statusDot = document.createElement("span");
    statusDot.style.height = "10px";
    statusDot.style.width = "10px";
    statusDot.style.borderRadius = "50%";
    statusDot.style.display = "inline-block";
    statusDot.style.backgroundColor = user.isOnline === true ? "green" : "grey";

    const userStatusSpan = document.createElement("span");
    const userStatusIcon = document.createElement("i");

    // Set the appropriate icon and color based on the user's status
    if (user.status === "OK") {
      userStatusIcon.classList.add("fa-solid", "fa-circle-check");
      userStatusSpan.style.color = "green";
      userStatusSpan.textContent = " OK"; // Add some text
    } else if (user.status === "Help") {
      userStatusIcon.classList.add("fa-solid", "fa-circle-exclamation");
      userStatusSpan.style.color = "#DAA520";
      userStatusSpan.textContent = " Help";
    } else if (user.status === "Emergency") {
      userStatusIcon.classList.add("fa-solid", "fa-triangle-exclamation");
      userStatusSpan.style.color = "red";
      userStatusSpan.textContent = " Emergency";
    }

    // Add spacing between the icon and the text
    userStatusSpan.style.marginLeft = "10px"; // Space between username and status
    userStatusSpan.prepend(userStatusIcon); // Prepend the icon to the status text

    // Append the username and status dot to the list item
    listItem.appendChild(usernameSpan);
    listItem.appendChild(userStatusSpan);
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

$statusButton.on("click", function (event) {
  event.preventDefault();
  statusModal.show();
});

async function updateStatus(status) {
  console.log("User selected status:", status);

  const token = localStorage.getItem(KEY_TOKEN);

  if (!token) {
    console.error("No authorization token found.");
    void banner.showErrorMessage("You must log in first");
    return;
  }

  try {
    const response = await apiUpdateStatus({ status, token });
    void banner.showSuccessMessage(`Status updated to: ${response.status}`);
  } catch (error) {
    console.error("Error during status update:", error);
    if (error.response) {
      console.error("Response details:", error.response);
    }
    void banner.showErrorMessage("Failed to update status. Please try again.");
  }
}

modalBody.on("click", ".status-btn", function () {
  const status = $(this).data("status");
  updateStatus(status);
  statusModal.hide();
});

async function reloadPage() {
  await onPost();
}

async function onSystemConnect() {
  void banner.showSuccessMessage("Connected");
}

function onSystemConnectError(socket) {
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

function onSystemMaintenance(...channels) {
  return async function () {
    channels.forEach((channel) => {
      channel.disconnect();
    });
    await banner.showWarningMessage(
      "System is in maintenance. Jumping to home page..."
    );
    location.href = "index.html";
  };
}

$(document).ready(async () => {
  $buttonLogout.click(onLogout);
  const socket = io(NAMESPACE_SOCKET_IO_SYSTEM, {
    path: ENDPOINT_SOCKET_IO,
    auth: {
      token: localStorage.getItem(KEY_TOKEN)
    }
  });

  socket.on("connect", onSystemConnect);
  socket.on("connect_error", onSystemConnectError(socket));
  socket.on("user_join", reloadPage);
  socket.on("status_change", reloadPage);
  socket.on("user_leave", reloadPage);
  socket.on("system_maintenance", onSystemMaintenance(socket));

  await onPost();
});
