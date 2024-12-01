import { postMedical } from "./lib/post-medicalcenter.mjs";
import { validateAddress } from "./lib/validate-location.mjs";
import { KEY_TOKEN } from "./common/constants.mjs";
import { getMedicalCenter } from "./lib/get-medicalcenter.mjs";
import { deleteMedicalCenter } from "./lib/delete-medicalcenter.mjs";
import { Banner } from "./common/banner.mjs";
import { bannedUsernameSet } from "./common/banned-username-set.mjs";
import { updateMedical } from "./lib/update-medicalcenter.mjs";
import { getJWTPayload } from "./common/utils.mjs";
import {
  ENDPOINT_SOCKET_IO,
  NAMESPACE_SOCKET_IO_SYSTEM
} from "./lib/endpoints.mjs";
import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";
const modalValidate = new bootstrap.Modal($("#addressModal"));
const modalConfirm = new bootstrap.Modal($("#modal-confirm"));
const modalEdit = new bootstrap.Modal($("#editModal"));
const banner = new Banner($("#banner"));
let lat, lon;
const $modalAnnouncementContainer = $("#modal-announcement-container");

async function validate() {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }
  const address = {
    addressLines: [$("#ship-address").val()],
    locality: $("#locality").val(),
    administrativeArea: $("#state").val(),
    postalCode: $("#postcode").val(),
    country: $("#country").val()
  };

  if ($("#titles").val() == "") {
    $("#note")
      .text("Please Fill in Title")
      .css({ "color": "red", "font-style": "italic" });
  } else if ($("#titles").val().length < 4 || $("#titles").val().length > 50) {
    $("#note")
      .text("Title should be between 4-50 chars long")
      .css("color", "red");
  } else if (bannedUsernameSet.has($("#titles").val().toLowerCase())) {
    $("#note")
      .text("Title should not be a banned name")
      .css({ "color": "red", "font-style": "italic" });
  } else if ($("#ship-address").val() == "") {
    $("#note")
      .text("Please Fill in Address")
      .css({ "color": "red", "font-style": "italic" });
  } else if ($("#locality").val() == "") {
    $("#note")
      .text("Please Fill in City")
      .css({ "color": "red", "font-style": "italic" });
  } else if ($("#state").val() == "") {
    $("#note")
      .text("Please Fill in State")
      .css({ "color": "red", "font-style": "italic" });
  } else if ($("#postcode").val() == "") {
    $("#note")
      .text("Please Fill in Postcode")
      .css({ "color": "red", "font-style": "italic" });
  } else if ($("#country").val() == "") {
    $("#note")
      .text("Please Fill in Country")
      .css({ "color": "red", "font-style": "italic" });
  } else if ($("#introduction").val() == "") {
    $("#note")
      .text("Please Fill in Introduction")
      .css({ "color": "red", "font-style": "italic" });
  } else {
    try {
      console.log(address);
      const res = await validateAddress({ address });
      console.log(res);
      modalValidate.hide();
      modalConfirm.show();
      $("#confirm").text(`Address: ${res.result.address.formattedAddress}`);
      $("#modal-confirm-join-btn-confirm")
        .off("click")
        .on("click", () => onConfirmJoin(res));
      $("#note")
        .text("* = required field")
        .css({ "color": "black", "font-style": "italic" });
    } catch (e) {
      console.error(e);
      $("#note")
        .text("Address Validation Failed")
        .css({ "color": "red", "font-style": "italic" });
    }
  }
}

async function onConfirmJoin(res) {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }
  try {
    const req = {
      title: $("#titles").val(),
      location: res.result.geocode.location,
      introduction: $("#introduction").val(),
      address: res.result.address.formattedAddress
    };
    console.log(req);
    const res1 = await postMedical({ req, token });
    console.log(res1);
    modalConfirm.hide();
    document.getElementById("address-form").reset();
    $("#note")
      .text("* = required field")
      .css({ "color": "black", "font-style": "italic" });
    markMedicalCenter();
    void banner.showSuccessMessage("Post New Meidcal Center Successfully!");
  } catch (e) {
    console.error(e);
    modalConfirm.hide();
    document.getElementById("address-form").reset();
    $("#note")
      .text("* = required field")
      .css({ "color": "black", "font-style": "italic" });
    void banner.showErrorMessage("The address has been used");
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRadians = (deg) => (deg * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function onDelete(id) {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }
  try {
    const res = await deleteMedicalCenter({ id, token });
    console.log(res);
    await markMedicalCenter();
    void banner.showSuccessMessage("Delete Meidcal Center Successfully!");
  } catch (e) {
    console.error(e);
    void banner.showErrorMessage("Delete Failed, Please refresh and try again");
  }
}

async function onupdate() {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }
  if ($("#edit-intro").val() != "") {
    try {
      const mcId = $("#editModal").attr("data-mcid");
      const introduction = $("#edit-intro").val();
      const res = await updateMedical({ introduction, mcId, token });
      console.log(res);
      modalEdit.hide();
      markMedicalCenter();
    } catch (e) {
      console.error(e);
      modalEdit.hide();
    }
  } else {
    $("#note-edit")
      .text("Please Fill in Introduction")
      .css({ "color": "red", "font-style": "italic" });
  }
}

async function markMedicalCenter() {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }
  const mapElement = document.querySelector("#map");
  try {
    while (mapElement.firstChild) {
      mapElement.removeChild(mapElement.firstChild);
    }
    const res = await getMedicalCenter({ token });
    console.log(res);
    const medicalCenters = res.medicalcenters;
    medicalCenters.forEach((center) => {
      const marker = document.createElement("gmp-advanced-marker");
      marker.setAttribute(
        "position",
        `${center.location.latitude}, ${center.location.longitude}`
      );
      marker.setAttribute("title", center.title);

      const img = document.createElement("img");
      img.className = "flag-icon";
      img.src =
        "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";

      marker.appendChild(img);
      marker.addEventListener("click", () => {
        location.href = `review.html?mcId=${center.mcId}`;
      });
      mapElement.appendChild(marker);
    });

    const sortedCenters = medicalCenters
      .map((center) => {
        const distance = calculateDistance(
          lat,
          lon,
          center.location.latitude,
          center.location.longitude
        );
        return { ...center, distance };
      })
      .sort((a, b) => a.distance - b.distance);

    const ul = document.getElementById("data-list");
    ul.innerHTML = "";
    sortedCenters.forEach((center) => {
      const component = document.createElement("div");
      component.className = "card";
      const li = document.createElement("h4");
      li.textContent = `${center.title}`;
      const l2 = document.createElement("p");
      l2.textContent = `${center.address}`;
      component.appendChild(li);
      component.appendChild(l2);
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "button-container";
      if (center.isUser) {
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "btn btn-danger btn-sm delete";
        deleteButton.addEventListener("click", () => {
          onDelete(center.mcId);
        });
        buttonContainer.appendChild(deleteButton);
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "btn btn-primary btn-sm delete";
        editButton.addEventListener("click", () => {
          modalEdit.show();
          $("#editModal").attr("data-mcid", center.mcId);
        });
        buttonContainer.appendChild(editButton);
      }
      const openButton = document.createElement("button");
      openButton.textContent = "Details";
      openButton.className = "btn btn-success btn-sm delete";
      openButton.addEventListener("click", () => {
        location.href = `review.html?mcId=${center.mcId}`;
      });
      buttonContainer.appendChild(openButton);
      component.appendChild(buttonContainer);
      ul.appendChild(component);
    });
  } catch (e) {
    console.error(e);
    void banner.showErrorMessage("Loading Failed or no Medical Center");
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
  const mapElement = document.getElementById("map");
  $("#modal-confirm-join-btn-confirm").on("click", onConfirmJoin);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        lat = latitude;
        lon = longitude;
        markMedicalCenter();
        mapElement.setAttribute("center", `${latitude},${longitude}`);
        console.log(`Map center set to: ${latitude}, ${longitude}`);
      },
      (error) => {
        console.error("Error getting location:", error.message);
        markMedicalCenter();
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
    markMedicalCenter();
  }

  $("#save-address").on("click", function (event) {
    event.preventDefault();
    validate();
    $("#addressModal .modal-body").scrollTop(0);
  });

  $("#update").on("click", function (event) {
    event.preventDefault();
    onupdate();
  });

  $("#close-button").on("click", function () {
    $("#address-form")[0].reset();
    $("#note")
      .text("* = required field")
      .css({ "color": "black", "font-style": "italic" });
  });

  $("#modal-confirm").on("hidden.bs.modal", function () {
    $("#address-form")[0].reset();
    $("#note")
      .text("* = required field")
      .css({ "color": "black", "font-style": "italic" });
  });

  $("#editModal").on("hidden.bs.modal", function () {
    $("#edit-form")[0].reset();
    $("#note-edit")
      .text("* = required field")
      .css({ "color": "black", "font-style": "italic" });
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

  socketSystem.on("connect", () => {
    void banner.showSuccessMessage("Connected");
  });
  socketSystem.on("connect_error", onSystemConnectError(socketSystem));
  socketSystem.on("system_maintenance", onSystemMaintenance(socketSystem));
  socketSystem.on(
    "new_announcement",
    onNewAnnouncement(modalAnnouncement, $viewButton)
  );
  socketSystem.on("user_logout", onUserLogout(socketSystem));
});
