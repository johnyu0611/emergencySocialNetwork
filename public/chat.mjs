import { Banner } from "./common/banner.mjs";
import {
  KEY_TOKEN,
  ANNOUCEMENT_SPACE_ID,
  PUBLIC_CHATROOM_ID
} from "./common/constants.mjs";
import { parseQueryParameters } from "./common/utils.mjs";
import {
  ENDPOINT_SOCKET_IO,
  NAMESPACE_SOCKET_IO_CHATROOM,
  NAMESPACE_SOCKET_IO_SYSTEM
} from "./lib/endpoints.mjs";
import { getHistoryMessages } from "./lib/get-history-messages.mjs";
import { logout } from "./lib/logout.mjs";
import { postMessage } from "./lib/post-message.mjs";
import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";
import { getChatroom } from "./lib/get-chatroom.mjs";
import { postChatroom } from "./lib/post-new-chatroom.mjs";
import { performSearch } from "./common/perform-search.mjs";

await fetchComponents();

const banner = new Banner($("#banner"));
const $inputBox = $("#input-box");
const $buttonPost = $("#button-post");
const $buttonLogout = $("#button-logout");
const $searchButton = $("#button-search");
const searchModal = new bootstrap.Modal($("#modal-search"));
const $performSearchButton = $("#perform-search-button");
const $chatHistoryContainer = $("#chat-history-container");
const $chatRoomContainer = $("#chat-room-container");
const $buttonroomid = $("#get-chatrooms");
let socketChatroom = undefined;
let roomStatus = {};
let userStatus = {};
const annoucementModal = new bootstrap.Modal($("#modal-announcement"));
const $viewButton = $("#modal-announcement .modal-body #viewButton");

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
  //box.find("div.user").find("span.status").text(` (${status})`);
  box.find("div.time").text(time);
  box.find("div.message").text(message);
  let iconHTML;
  if (status === "OK") {
    iconHTML = `<i class="fa-solid fa-circle-check" style="color: green;"></i>`;
  } else if (status === "Help") {
    iconHTML = `<i class="fa-solid fa-circle-exclamation" style="color: #DAA520;"></i>`;
  } else if (status === "Emergency") {
    iconHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: red;"></i>`;
  }
  box.find("span.status").html(iconHTML);
  return box;
}

function chatroomBox(currentRoomId, roomid, title, isread, status) {
  const box = $(`
    <li class="nav-item">
      <a class="nav-link" data-bs-toggle="pill" role="tab" aria-controls="chat${roomid}" aria-selected="false" data-bs-dismiss="offcanvas" aria-label="Close">
      <span class="unread-dot" id="dot"></span>
      ${title}
      <span class="icon" id="icon"></span>
      </a>
    </li>
  `);

  if (roomid === currentRoomId) {
    box.find("a").addClass("active");
  }
  let iconHTML;
  if (status === "OK") {
    iconHTML = `<i class="fa-solid fa-circle-check" style="color: green;"></i>`;
  } else if (status === "Help") {
    iconHTML = `<i class="fa-solid fa-circle-exclamation" style="color: #DAA520;"></i>`;
  } else if (status === "Emergency") {
    iconHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: red;"></i>`;
  }
  box.find("span.icon").html(iconHTML);
  box.find("a").on("click", async function (e) {
    e.preventDefault();
    const token = localStorage.getItem(KEY_TOKEN);
    if (!token) {
      location.href = "register.html";
    }
    try {
      if (title in userStatus) {
        const res = await postChatroom({ title, token });
        const { [title]: removed, ...rest } = userStatus;
        userStatus = rest;
        roomStatus[title] = false;
        box.find("a").attr("aria-controls", `chat${res.id}`);
        switchRoom(res.id);
      } else {
        switchRoom(roomid);
      }
    } catch (error) {
      console.error(error);
    }
  });
  if (!isread) {
    const dot = box.find("span.unread-dot");
    dot.css("visibility", "hidden");
  }
  return box;
}

function switchRoom(roomid) {
  location.href = `chat.html?roomId=${roomid}`;
}

async function getChatRoomList(roomId) {
  userStatus = {};
  roomStatus = {};
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }
  try {
    const res = await getChatroom({ token, roomId });
    const chatroomlist = res.chatrooms;
    chatroomlist.map((e) => {
      if (e.id) {
        roomStatus[e.id] = e.hasUnread;
      } else {
        userStatus[e.receiver] = false;
      }
    });
    $chatRoomContainer.empty();
    $chatRoomContainer.append(
      chatroomlist.map((e) => {
        let box;
        if (e.id) {
          if (e.id === PUBLIC_CHATROOM_ID) {
            box = chatroomBox(roomId, e.id, e.title, roomStatus[e.id], null);
          } else {
            box = chatroomBox(
              roomId,
              e.id,
              e.receiver,
              roomStatus[e.id],
              e.status
            );
          }
        } else {
          box = chatroomBox(roomId, null, e.receiver, false, e.status);
        }
        return box;
      })
    );
    $chatRoomContainer.scrollTop($chatRoomContainer.prop("scrollHeight"));
  } catch (error) {
    console.error(error);
  }
}

function updateStatus(roomid, isread) {
  roomStatus[roomid] = isread;
  const chatroomBox = $(
    `#chat-room-container li a[aria-controls="chat${roomid}"] .unread-dot`
  );
  if (isread) {
    chatroomBox.show();
  } else {
    chatroomBox.hide();
  }
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

function onPost(roomId) {
  return async function () {
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
  };
}

function onChatroomMessage(roomId) {
  return async function (socketIOMessage) {
    // await getChatRoomList();
    const { chatroomId, sender, content, timestamp, status } = socketIOMessage;
    if (chatroomId === roomId) {
      const scroll =
        $chatHistoryContainer.scrollTop() +
          $chatHistoryContainer.innerHeight() >=
        $chatHistoryContainer.prop("scrollHeight") - 1;
      $chatHistoryContainer.append(
        messageBox(sender, timestamp, content, status)
      );
      if (scroll) {
        $chatHistoryContainer.scrollTop(
          $chatHistoryContainer.prop("scrollHeight")
        );
      }
    } else {
      if (chatroomId in roomStatus) {
        if (chatroomId !== PUBLIC_CHATROOM_ID) {
          updateStatus(chatroomId, true);
          banner.showWarningMessage(`New Message from ${sender}`);
        }
      }
    }
  };
}

function onSocketIONewChatroom(socketIOMessage) {
  const { chatroomId, sender, content, timestamp, status } = socketIOMessage;
  updateStatus(chatroomId, false);
}

function onChatroomConnect(roomId) {
  return async function (socketIOMessage) {
    void banner.showSuccessMessage("Connected");
    $chatHistoryContainer.empty();
    await populateHistoryMessages(roomId);
    await getChatRoomList(roomId);
  };
}

function onChatroomConnectError(socket) {
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
    $chatHistoryContainer.empty();
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

function onNewAnnouncement(roomId) {
  return async function () {
    if (roomId != ANNOUCEMENT_SPACE_ID) {
      await banner.showWarningMessage(
        "New Annoucement available. Action needed..."
      );
      // location.href = `chat.html?roomId=${ANNOUCEMENT_SPACE_ID}`;
      annoucementModal.show();
    }
  };
}

async function populateHistoryMessages(roomId) {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }

  try {
    const { messages } = await getHistoryMessages({ token, roomId });
    $chatHistoryContainer.append(
      messages.map((e) =>
        messageBox(e.sender, e.timestamp, e.content, e.status)
      )
    );
    $chatHistoryContainer.scrollTop($chatHistoryContainer.prop("scrollHeight"));
  } catch (error) {
    console.error(error);
  }
}

$(document).ready(async () => {
  const roomId = parseQueryParameters(location.href).roomId;
  if (roomId != ANNOUCEMENT_SPACE_ID) {
    $("#get-chatrooms").show();
    $("#announcement-text").hide();
  }
  $buttonLogout.click(onLogout);
  $buttonPost.click(onPost);
  $buttonroomid.click(() => {
    getChatRoomList(roomId);
  });

  $buttonLogout.click(onLogout);
  $buttonPost.click(onPost(roomId));

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

  socketChatroom = io(NAMESPACE_SOCKET_IO_CHATROOM, {
    path: ENDPOINT_SOCKET_IO,
    query: {
      roomId
    },
    auth: {
      token: localStorage.getItem(KEY_TOKEN)
    }
  });

  const socketSystem = io(NAMESPACE_SOCKET_IO_SYSTEM, {
    path: ENDPOINT_SOCKET_IO,
    auth: {
      token: localStorage.getItem(KEY_TOKEN)
    }
  });

  socketChatroom.on("connect", onChatroomConnect(roomId));
  socketChatroom.on("connect_error", onChatroomConnectError(socketChatroom));
  socketChatroom.on("message", onChatroomMessage(roomId));
  socketChatroom.on("newChatroom", onSocketIONewChatroom);

  socketSystem.on("status_change", () => {
    getChatRoomList(roomId);
  });
  socketSystem.on(
    "system_maintenance",
    onSystemMaintenance(socketChatroom, socketSystem)
  );

  socketSystem.on("new_announcement", onNewAnnouncement(roomId));
});
