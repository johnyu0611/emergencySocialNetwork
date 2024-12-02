import { getSpecificUser } from "./lib/get-specific-user.mjs";
import { parseQueryParameters } from "./common/utils.mjs";
import { KEY_TOKEN } from "./common/constants.mjs";
import { changeUserInfo } from "./lib/change-user-info.mjs";
import { Banner } from "./common/banner.mjs";
import { getJWTPayload } from "./common/utils.mjs";
import {
  ENDPOINT_SOCKET_IO,
  NAMESPACE_SOCKET_IO_SYSTEM
} from "./lib/endpoints.mjs";
import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";
const modalValidate = new bootstrap.Modal($("#modal-edit"));
const modalConfirm = new bootstrap.Modal($("#modal-confirm"));
const banner = new Banner($("#banner"));
const $modalAnnouncementContainer = $("#modal-announcement-container");
async function getUserInformation(userId) {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }
  try {
    const res = await getSpecificUser({ token, userId });
    console.log(res);
    $("#text-username").text(res.username);
    $("#text-privilege-level").text(res.privilege);
    if (res.isActive == true) {
      $("#text-active").text("Active");
    } else {
      $("#text-active").text("InActive");
    }
  } catch (e) {
    console.error(e);
    void banner.showErrorMessage("Get User Failed");
  }
}

async function validate(userId) {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }

  try {
    const citizenId = Number(userId);
    const validation = true;
    const username = $("#edit-username").val()
      ? $("#edit-username").val()
      : null;
    const password = $("#edit-password").val()
      ? $("#edit-password").val()
      : null;
    const privilege =
      $("#privilege").val() !== "undefined" ? $("#privilege").val() : null;

    const res = await changeUserInfo({
      citizenId,
      validation,
      username,
      password,
      privilege,
      token
    });
    console.log(res);
    if (
      res.userFlag !== "" ||
      res.passwordFlag !== "" ||
      res.privilegeFlag !== ""
    ) {
      let error_message = "";
      if (res.userFlag !== "") {
        error_message = res.userFlag;
        console.log(error_message);
      }
      if (res.passwordFlag !== "") {
        if (res.userFlag !== "") {
          error_message += " AND ";
        }
        error_message += res.passwordFlag;
      }
      if (res.privilegeFlag !== "") {
        if (res.userFlag !== "" || res.passwordFlag !== "") {
          error_message += " AND ";
        }
        error_message += res.privilegeFlag;
      }

      $("#note")
        .text(error_message)
        .css({ "color": "red", "font-style": "italic" });
    } else {
      modalValidate.hide();
      modalConfirm.show();
    }
  } catch (e) {
    console.error(e);
  }
}

async function onConfirmEdit(userId) {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }

  try {
    const citizenId = Number(userId);
    const validation = false;
    const username = $("#edit-username").val()
      ? $("#edit-username").val()
      : null;
    const password = $("#edit-password").val()
      ? $("#edit-password").val()
      : null;
    const privilege =
      $("#privilege").val() !== "undefined" ? $("#privilege").val() : null;
    let isActive = null;
    if ($("#active").val() === "true") {
      isActive = true;
    } else if ($("#active").val() === "false") {
      isActive = false;
    }
    console.log(isActive);
    const res = await changeUserInfo({
      citizenId,
      validation,
      username,
      privilege,
      isActive,
      password,
      token
    });
    console.log(res);
    modalConfirm.hide();
    document.getElementById("edit-form").reset();
    $("#text-username").text(res.username);
    $("#text-privilege-level").text(res.privilege);
    if (res.isActive == true) {
      $("#text-active").text("Active");
    } else {
      $("#text-active").text("InActive");
    }
  } catch (e) {
    console.error(e);
    void banner.showErrorMessage("Edit Failed");
  }
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

function onNewAnnouncement(announcementModal, $viewButton) {
  $viewButton.on("click", function (event) {
    event.preventDefault();
    location.href = `chat.html?roomId=${ANNOUCEMENT_SPACE_ID}`;
  });

  return async function () {
    await banner.showWarningMessage(
      "New Annoucement available. Action needed..."
    );
    announcementModal.show();
  };
}

function onUserLogout() {
  return async function (socketIOMessage) {
    console.log("here");
    const token = localStorage.getItem(KEY_TOKEN);
    const { citizenId } = socketIOMessage;
    const { userId } = getJWTPayload(token);

    console.log(citizenId);
    console.log(userId);
    if (citizenId === userId) {
      alert("You are set to inactive account");
      location.href = "index.html";
    }
  };
}

$(document).ready(async () => {
  const userId = parseQueryParameters(location.href).userId;
  $("#modal-confirm-join-btn-confirm").on("click", function () {
    onConfirmEdit(userId);
  });
  await getUserInformation(userId);

  $("#edit-validate").on("click", async (event) => {
    event.preventDefault();
    await validate(userId);
    //document.getElementById("address-form").reset();
  });

  $("#close-button").on("click", function () {
    $("#edit-form")[0].reset();
    $("#note")
      .text("You can edit specific elements and leave other blank")
      .css({ "color": "black", "font-style": "italic" });
  });

  $("#modal-confirm-join-btn-cancel").on("click", function () {
    modalValidate.show();
  });

  $("#close-confirm").on("click", function () {
    modalValidate.show();
  });

  $modalAnnouncementContainer.html(
    await (await fetch("component/modal-announcement.html")).text()
  );
  const modalAnnouncement = new bootstrap.Modal(
    $modalAnnouncementContainer.find("#modal-announcement")
  );
  const $viewButton = $modalAnnouncementContainer.find("#viewButton");

  const socketSystem = io(NAMESPACE_SOCKET_IO_SYSTEM, {
    path: ENDPOINT_SOCKET_IO,
    auth: {
      token: localStorage.getItem(KEY_TOKEN)
    }
  });

  socketSystem.on("connect", () => {});
  socketSystem.on("connect_error", onSystemConnectError(socketSystem));
  socketSystem.on("system_maintenance", onSystemMaintenance(socketSystem));
  socketSystem.on(
    "new_announcement",
    onNewAnnouncement(modalAnnouncement, $viewButton)
  );
  socketSystem.on("user_logout", onUserLogout(socketSystem));
});
