import { Banner } from "./common/banner.mjs";
import {
  KEY_TOKEN,
  ANNOUCEMENT_SPACE_ID,
  PUBLIC_CHATROOM_ID
} from "./common/constants.mjs";
import { sleep } from "./common/utils.mjs";
import {
  ENDPOINT_SOCKET_IO,
  NAMESPACE_SOCKET_IO_SYSTEM,
  NAMESPACE_SOCKET_IO_CHATROOM
} from "./lib/endpoints.mjs";
import { getESNDirectory } from "./lib/get-esndirectory.mjs";
import { logout } from "./lib/logout.mjs";
import { updateStatus as apiUpdateStatus } from "./lib/change-status.mjs";
import { updateEmergencyContact } from "./lib/create-emergency-contact.mjs";
import { getEmergencyContact } from "./lib/get-emergency-contact.mjs";
import { sendChallenge } from "./lib/sendChallenge.mjs";
import { acceptChallenge } from "./lib/acceptChallenge.mjs";
import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";
import { getChatroom } from "./lib/get-chatroom.mjs";
import { postChatroom } from "./lib/post-new-chatroom.mjs";
import { performSearch } from "./common/perform-search.mjs";
import { getJWTPayload } from "./common/utils.mjs";
import { getUsernameById } from "./lib/get-username.mjs";

await fetchComponents();

const banner = new Banner($("#banner"));
const $buttonLogout = $("#button-logout");
const $statusButton = $("#share-status");
const statusModal = new bootstrap.Modal($("#modal-status"));
const $searchButton = $("#button-search");
const searchModal = new bootstrap.Modal($("#modal-search"));
const $performSearchButton = $("#perform-search-button");
const modalBody = $("#modal-status .modal-body");
const annoucementModal = new bootstrap.Modal($("#modal-announcement"));
const $viewButton = $("#modal-announcement .modal-body #viewButton");
const $modalLocationSharing = $("#modal-location-sharing");
const modalLocationSharing = new bootstrap.Modal($modalLocationSharing);
const $modalLocationSharingTitle = $("#modal-location-sharing-label");
const $modalLocationSharingConfirmButton = $(
  "#button-modal-location-sharing-yes"
);
const $emergencyContactButton = $("#emergency-contact");
const $emergencyContactModal = new bootstrap.Modal(
  $("#modal-emergency-contact")
);
const emergencyContactForm = $("#emergency-contact-form");
const challengeModal = new bootstrap.Modal($("#modal-challenge"));
const $sendChallengeButton = $("#sendChallengeButton");
const invitationModal = new bootstrap.Modal($("#modal-invitation"));
const $acceptChallengeButton = $("#acceptChallengeButton");
let socketChatroom = undefined;
let roomStatus = {};
let selectedUser = null;
let questionID = null;

async function onPost() {
  try {
    await sleep(50);
    const token = localStorage.getItem(KEY_TOKEN);
    const response = await getESNDirectory({ token });
    const users = response.users;
    console.log(users);
    const uniqueUsers = Array.from(
      new Map(users.map((user) => [user.username, user])).values()
    );
    await getChatRoomList({ token });
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
    return a.username.localeCompare(b.username);
  });

  sortedUsers.forEach(async (user) => {
    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item");
    listItem.style.display = "flex";
    listItem.style.justifyContent = "space-between";
    listItem.style.alignItems = "center";
    listItem.style.color = user.isOnline === true ? "green" : "grey";

    const userInfoContainer = document.createElement("div");
    userInfoContainer.style.display = "flex";
    userInfoContainer.style.alignItems = "center";
    userInfoContainer.style.width = "50%";
    // Create a span for the username
    const usernameSpan = document.createElement("span");
    usernameSpan.textContent = user.username;
    usernameSpan.style.marginLeft = "10px";

    // Create a span for the status dot
    const statusDot = document.createElement("span");
    statusDot.style.height = "10px";
    statusDot.style.width = "10px";
    statusDot.style.borderRadius = "50%";
    statusDot.style.display = "inline-block";
    statusDot.style.marginLeft = "15px";
    statusDot.style.backgroundColor = user.isOnline === true ? "green" : "grey";

    const userStatusIcon = document.createElement("i");

    // Set the appropriate icon and color based on the user's status
    if (user.status === "OK") {
      userStatusIcon.classList.add("fa-solid", "fa-circle-check");
      userStatusIcon.style.color = "green";
      //userStatusSpan.textContent = " OK"; // Add some text
    } else if (user.status === "Help") {
      userStatusIcon.classList.add("fa-solid", "fa-circle-exclamation");
      userStatusIcon.style.color = "#DAA520";
      //userStatusSpan.textContent = " Help";
    } else if (user.status === "Emergency") {
      userStatusIcon.classList.add("fa-solid", "fa-triangle-exclamation");
      userStatusIcon.style.color = "red";
      //userStatusSpan.textContent = " Emergency";
    } else {
      userStatusIcon.classList.add("fa-solid", "fa-triangle-exclamation");
      userStatusIcon.style.visibility = "hidden";
    }
    userInfoContainer.appendChild(userStatusIcon);
    userInfoContainer.appendChild(usernameSpan);

    const messageIcon = document.createElement("i");
    messageIcon.classList.add("fa-solid", "fa-message");
    if (roomStatus[user.username] && roomStatus[user.username].hasUnread) {
      messageIcon.style.color = "red";
    } else {
      messageIcon.style.color = "grey";
    }
    //messageIcon.style.color = "blue"; // Set the color of the message icon
    messageIcon.style.marginLeft = "15px";
    messageIcon.setAttribute("data-username", user.username);

    // Add spacing between the icon and the text
    //userStatusSpan.style.marginRight = "10px"; // Space between username and status
    //userStatusSpan.prepend(userStatusIcon); // Prepend the icon to the status text

    // Append the username and status dot to the list item
    listItem.appendChild(userInfoContainer);

    const token = localStorage.getItem(KEY_TOKEN);
    const { userId } = getJWTPayload(token);
    //const { username: currentUsername } = await getUsernameById({userId, token});

    // *** NEW: Add the "Versus" icon for all online users ***
    const versusIcon = document.createElement("img");
    versusIcon.src = "asset/versus.png";
    versusIcon.alt = "Challenge";
    versusIcon.style.width = "30px";
    versusIcon.style.height = "30px";
    versusIcon.style.cursor = "pointer";
    versusIcon.style.marginLeft = "auto";
    if (!user.isOnline || user.userId === userId) {
      versusIcon.style.visibility = "hidden";
    }

    versusIcon.addEventListener("click", () => {
      // alert(`About to challenge ${user.username}!`);
      // location.href = "challenge.html";
      selectedUser = user.username;
      const modalBody = document.querySelector(
        "#modal-challenge .modal-body p"
      );
      modalBody.textContent = `Send quiz challenge to ${user.username}?`;
      challengeModal.show();
    });

    listItem.appendChild(versusIcon);

    listItem.appendChild(messageIcon);
    listItem.appendChild(statusDot);
    userList.appendChild(listItem);
  });
}

function postLogout() {
  localStorage.removeItem(KEY_TOKEN);
  location.href = "index.html";
}

async function openChat(user) {
  try {
    const token = localStorage.getItem(KEY_TOKEN);
    let title = user;
    const res = await postChatroom({ title, token });
    console.log(res);
    location.href = `chat.html?roomId=${res.id}`;
  } catch (e) {
    console.error(e);
  }
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

async function getChatRoomList(roomId) {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }
  try {
    const res = await getChatroom({ token, roomId });
    const chatroomlist = res.chatrooms;
    roomStatus = {};
    chatroomlist.map((e) => {
      if (e.id && e.receiver) {
        roomStatus[e.receiver] = { hasUnread: e.hasUnread, id: e.id };
      }
    });
  } catch (error) {
    console.error(error);
  }
}

let reloadTimeout;

async function reloadPage() {
  clearTimeout(reloadTimeout);
  reloadTimeout = setTimeout(async () => {
    await onPost();
  }, 300); // Debounce reloads with a 300ms delay
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

$viewButton.on("click", function (event) {
  event.preventDefault();
  location.href = `chat.html?roomId=${ANNOUCEMENT_SPACE_ID}`;
});

function onNewAnnouncement() {
  return async function () {
    await banner.showWarningMessage(
      "New Annoucement available. Action needed..."
    );
    annoucementModal.show();
  };
}

function hasReceiver(receiverToFind) {
  return Object.values(roomStatus).some((item) => item.id === receiverToFind);
}

function onChatroomMessage() {
  return async function (socketIOMessage) {
    // await getChatRoomList();
    const { chatroomId, sender, content, timestamp, status } = socketIOMessage;
    await reloadPage();
    if (sender in roomStatus && hasReceiver(chatroomId)) {
      if (chatroomId !== PUBLIC_CHATROOM_ID) {
        banner.showWarningMessage(`New Message from ${sender}`);
      }
    }
  };
}

function onNewLocationSharingSession(token) {
  return async function ({ userId, sessionId }) {
    const { username } = await getUsernameById({ userId, token });
    $modalLocationSharingTitle.text(`User ${username} called for help!`);
    $modalLocationSharingConfirmButton.click((event) => {
      event.preventDefault();
      location.href = `share-location.html?joinSession=${sessionId}`;
    });
    modalLocationSharing.show();
  };
}

async function loadEmergencyContact() {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }
  try {
    const res = await getEmergencyContact({ token });
    console.log(res);
    const username = res.username;
    const fullName = res.fullName;
    const email = res.email;

    $("#contact-username").val(username);
    $("#contact-fullname").val(fullName);
    $("#contact-email").val(email);
  } catch (error) {
    console.error(error);
  }
}

async function saveEmergencyContact(fullName, username, email) {
  const token = localStorage.getItem(KEY_TOKEN);

  if (!token) {
    console.error("No authorization token found.");
    void banner.showErrorMessage("You must log in first");
    return;
  }

  try {
    const response = await updateEmergencyContact({
      fullName,
      username,
      email,
      token
    });
    void banner.showSuccessMessage(
      `Emermegency contact set: ${response.emergencyContact}`
    );
  } catch (error) {
    console.error("Error during update emergency contact:", error);
    if (error.message) {
      console.error("Response details:", error.message);
    }
    if (error.status === 400) {
      void banner.showErrorMessage(`${error.message}`);
      return;
    }
    void banner.showErrorMessage(
      "Incorrect emergency contact info. Please try again"
    );
  }

  $("#contact-username").val("");
  $("#contact-fullname").val("");
  $("#contact-email").val("");
}

async function callIfEmergencyContactOnline() {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }
  try {
    const res = await getEmergencyContact({ token });
    const isOnline = res.isOnline;
    console.log(res);
    if (isOnline) {
      location.href = "video-call-caller.html";
    }
  } catch (error) {
    console.error(error);
  }
}

async function onNewVideoCall(emergencyContact) {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }

  const res = await getEmergencyContact({ token });
  const username = res.curr;
  console.log("HIIIII");
  console.log(res);

  if (username === emergencyContact) {
    location.href = "video-call-callee.html";
  }
}

async function onNewChallenge(data) {
  const { challenger, challenged, questionID: targetQuestionID } = data;
  questionID = targetQuestionID;

  // Get the current username from the JWT token
  const token = localStorage.getItem(KEY_TOKEN);
  const { userId } = getJWTPayload(token);
  const { username: currentUsername } = await getUsernameById({
    userId,
    token
  });

  // If the current user is the one being challenged, display the modal
  if (challenged === currentUsername) {
    selectedUser = challenger;
    const modalBody = document.querySelector("#modal-invitation .modal-body p");
    modalBody.textContent = `${challenger} invites you to a quiz challenge. Do you accept?`;
    invitationModal.show();
  }
}

async function onChallengeAccepted(data) {
  const { challenger, challenged, questionID } = data;

  // Get the current username
  const token = localStorage.getItem(KEY_TOKEN);
  const { userId } = getJWTPayload(token);
  const { username: currentUsername } = await getUsernameById({
    userId,
    token
  });

  // Redirect only if the current user is part of the challenge
  if (currentUsername === challenger || currentUsername === challenged) {
    // window.location.href = "challenge.html";
    const challengeURL = `challenge.html?questionID=${questionID}`;
    window.location.href = challengeURL;
  }
}

$(document).ready(async () => {
  $buttonLogout.click(onLogout);

  $statusButton.on("click", function (event) {
    event.preventDefault();
    statusModal.show();
  });
  modalBody.on("click", ".status-btn", function () {
    const status = $(this).data("status");
    updateStatus(status);
    statusModal.hide();
    callIfEmergencyContactOnline();
  });

  $emergencyContactButton.on("click", function (event) {
    event.preventDefault();
    $emergencyContactModal.show();
    loadEmergencyContact();
  });
  emergencyContactForm.on("submit", function (event) {
    event.preventDefault();
    const username = $("#contact-username").val();
    const fullName = $("#contact-fullname").val();
    const email = $("#contact-email").val();
    saveEmergencyContact(fullName, username, email);
    console.log("Contact Username:", username);
    $emergencyContactModal.hide();
  });

  $searchButton.on("click", function (event) {
    event.preventDefault();
    searchModal.show();
    //clearing previous searched results on opening
    const resultsContainer = document.getElementById("searchResults");
    resultsContainer.innerHTML = "";
    const searchInput = document.getElementById("searchInput");
    searchInput.value = "";
  });

  let stopSearchState = { isSearchStopped: false };
  let searchState = { isSearchInProgress: false };

  function stopSearch() {
    stopSearchState.isSearchStopped = true;
    console.log("user stops search!");

    const performSearchButton = document.getElementById(
      "perform-search-button"
    );
    performSearchButton.disabled = false;
    loadMoreButton.style.display = "none";
  }

  const stopSearchButton = document.getElementById("stop-search-button");
  stopSearchButton.addEventListener("click", stopSearch);

  $performSearchButton.on("click", function (event) {
    const selectedOption = document.querySelector(
      'input[name="searchOption"]:checked'
    ).value;
    const query = document.getElementById("searchInput").value;
    const token = localStorage.getItem(KEY_TOKEN);
    if (!token) {
      location.href = "register.html";
    }

    stopSearchState.isSearchStopped = false;
    let roomId = "00000000-0000-0000-0000-000000000000";
    performSearch(
      selectedOption,
      query,
      roomId,
      token,
      stopSearchState,
      searchState
    );
  });

  const resultsContainer = document.getElementById("searchResults");
  const loadMoreButton = document.getElementById("loadMoreButton");
  const modal = document.getElementById("modalStatusLabel").closest(".modal");

  $(modal).on("hidden.bs.modal", function () {
    resultsContainer.innerHTML = "";
    loadMoreButton.style.display = "none";
  });

  $("input[name='searchOption']").on("change", function () {
    resultsContainer.innerHTML = "";
    loadMoreButton.style.display = "none";
  });

  const socket = io(NAMESPACE_SOCKET_IO_SYSTEM, {
    path: ENDPOINT_SOCKET_IO,
    auth: {
      token: localStorage.getItem(KEY_TOKEN)
    }
  });
  $("#user-list").on("click", ".fa-message", async function () {
    const username = $(this).attr("data-username");
    openChat(username);
  });

  socket.on("connect", onSystemConnect);
  socket.on("connect_error", onSystemConnectError(socket));
  socket.on("user_join", reloadPage);
  socket.on("status_change", reloadPage);
  socket.on("user_leave", reloadPage);
  socket.on("system_maintenance", onSystemMaintenance(socket));

  socket.on("new_announcement", onNewAnnouncement());
  socket.on(
    "new_location_sharing_session",
    onNewLocationSharingSession(localStorage.getItem(KEY_TOKEN))
  );

  socket.on("message", onChatroomMessage());

  socket.on("newOfferAwaiting", async (data) => {
    const { emergencyContact } = data;
    await onNewVideoCall(emergencyContact);
  });
  socket.on("new_challenge", onNewChallenge);
  socket.on("challenge_accepted", onChallengeAccepted);

  $sendChallengeButton.on("click", async function (event) {
    event.preventDefault();
    challengeModal.hide();

    const token = localStorage.getItem(KEY_TOKEN);
    const { userId } = getJWTPayload(token);
    const { username: currentUsername } = await getUsernameById({
      userId,
      token
    });
    const payload = {
      challenger: currentUsername,
      challenged: selectedUser
    };

    try {
      const { questionID } = await sendChallenge({ payload, token });
      localStorage.setItem("currentChallengeChallenger", currentUsername);
      localStorage.setItem("currentChallengeChallenged", selectedUser);
      localStorage.setItem("currentChallengeQuestionID", questionID);

      await banner.showSuccessMessage(
        "Challenge sent, waiting for response..."
      );
    } catch (error) {
      console.error(error);
      await banner.showWarningMessage(
        "Failed to send challenge: no question available",
        5000
      );
    }
  });

  $acceptChallengeButton.on("click", async function (event) {
    event.preventDefault();
    invitationModal.hide();
    // alert("Challenge accepted!");

    if (!selectedUser) {
      console.error("No challenger selected for accepting the challenge.");
      return;
    }
    const token = localStorage.getItem(KEY_TOKEN);
    const { userId } = getJWTPayload(token);
    const { username: currentUsername } = await getUsernameById({
      userId,
      token
    });

    const payload = {
      challenger: currentUsername,
      challenged: selectedUser,
      questionID: questionID
    };

    localStorage.setItem("currentChallengeChallenger", selectedUser);
    localStorage.setItem("currentChallengeChallenged", currentUsername);

    try {
      await acceptChallenge({ payload, token });
      await banner.showSuccessMessage("Challenge accepted! Redirecting...");
    } catch (error) {
      console.error(error);
      await banner.showErrorMessage("Failed to accept the challenge.");
    }
  });

  await onPost();
});
