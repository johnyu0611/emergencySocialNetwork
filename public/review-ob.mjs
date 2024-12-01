import { getReview } from "./lib/get-review.mjs";
import { parseQueryParameters } from "./common/utils.mjs";
import { KEY_TOKEN } from "./common/constants.mjs";
import { postReview } from "./lib/post-review.mjs";
import { Banner } from "./common/banner.mjs";
import { getJWTPayload } from "./common/utils.mjs";
import {
  ENDPOINT_SOCKET_IO,
  NAMESPACE_SOCKET_IO_SYSTEM
} from "./lib/endpoints.mjs";
import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";
const modalCreate = new bootstrap.Modal($("#addressModal"));
const $modalAnnouncementContainer = $("#modal-announcement-container");
const banner = new Banner($("#banner"));
class ReviewManager {
  constructor() {
    this.observers = [];
    this.state = {
      reviews: [],
      mc: null,
      rate: 0
    };
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  notify() {
    this.observers.forEach((observer) => observer.update(this.state));
  }

  async loadReviews(mcId) {
    const token = localStorage.getItem(KEY_TOKEN);
    if (!token) {
      location.href = "register.html";
      return;
    }
    try {
      const res = await getReview({ token, mcId });
      this.state.reviews = res.reviews;
      this.state.mc = res.mc;
      this.state.rate = res.rate.toFixed(1);
      this.notify();
    } catch (e) {
      console.error(e);
    }
  }

  async addReview(mcId, review) {
    const token = localStorage.getItem(KEY_TOKEN);
    if (!token) {
      location.href = "register.html";
      return;
    }
    try {
      const req = {
        ...review,
        mcId
      };
      await postReview({ token, req });
      modalCreate.hide();
      await this.loadReviews(mcId);
    } catch (e) {
      modalCreate.hide();
      console.error(e);
      void banner.showErrorMessage("Post failed, please try again!");
    }
  }
}

class ReviewRenderer {
  constructor(manager) {
    this.manager = manager;
  }

  update(state) {
    $("#title").text(state.mc?.title || "No Title");
    $("#intro").text(state.mc?.introduction || "No Introduction");
    $("#loca").text(state.mc?.address || "No Address");

    const rateStarElement = document.getElementById("rate-star");
    rateStarElement.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const star = `<span class="fa fa-star${i < state.rate ? " check" : ""}"></span>`;
      rateStarElement.innerHTML += star;
    }
    rateStarElement.innerHTML += `<span style="margin-left: 10px;">${state.rate}</span>`;

    const ul = document.getElementById("data-list");
    ul.innerHTML = "";
    state.reviews.forEach((review) => {
      const component = document.createElement("div");
      component.className = "card-review";

      const reviewContainer = document.createElement("div");
      reviewContainer.className = "review-container";

      const authorElement = document.createElement("span");
      authorElement.className = "review-author";
      authorElement.textContent = review.author;

      const timestampElement = document.createElement("span");
      timestampElement.className = "review-timestamp";
      timestampElement.textContent = new Date(
        review.timestamp
      ).toLocaleString();

      const ratingElement = document.createElement("div");
      ratingElement.className = "review-rating";
      for (let i = 0; i < review.rate; i++) {
        const star = `<span class="fa fa-star check"></span>`;
        ratingElement.innerHTML += star;
      }

      reviewContainer.appendChild(authorElement);
      reviewContainer.appendChild(timestampElement);
      reviewContainer.appendChild(ratingElement);

      const contentElement = document.createElement("p");
      contentElement.textContent = review.content;

      component.appendChild(reviewContainer);
      component.appendChild(contentElement);
      ul.appendChild(component);
    });
  }
}

function getSelectedRating() {
  const selectedInput = document.querySelector(
    '.rating input[name="rating"]:checked'
  );
  return selectedInput ? parseInt(selectedInput.value, 10) : null;
}

const reviewManager = new ReviewManager();
const reviewRenderer = new ReviewRenderer(reviewManager);
reviewManager.subscribe(reviewRenderer);

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
  const mcId = parseQueryParameters(location.href).mcId;

  await reviewManager.loadReviews(mcId);

  $("#save-address").on("click", async (event) => {
    event.preventDefault();
    const rate = getSelectedRating();
    const content = $("#content").val();
    if (rate && content) {
      await reviewManager.addReview(mcId, { rate, content });
    } else {
      $("#note")
        .text("Please Fill Both Content and Rate")
        .css({ "color": "red", "font-style": "italic" });
    }
    document.getElementById("address-form").reset();
  });

  $("#addressModal").on("hidden.bs.modal", function () {
    $("#address-form")[0].reset();
    $("#note")
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
