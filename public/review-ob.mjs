import { getReview } from "./lib/get-review.mjs";
import { parseQueryParameters } from "./common/utils.mjs";
import { KEY_TOKEN } from "./common/constants.mjs";
import { postReview } from "./lib/post-review.mjs";
import { Banner } from "./common/banner.mjs";
const modalCreate = new bootstrap.Modal($("#addressModal"));
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
});
