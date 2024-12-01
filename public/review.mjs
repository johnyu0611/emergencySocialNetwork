import { getReview } from "./lib/get-review.mjs";
import { parseQueryParameters } from "./common/utils.mjs";
import { KEY_TOKEN } from "./common/constants.mjs";
import { postReview } from "./lib/post-review.mjs";
import {
  ENDPOINT_SOCKET_IO,
  NAMESPACE_SOCKET_IO_SYSTEM
} from "./lib/endpoints.mjs";
import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";

const modalCreate = new bootstrap.Modal($("#addressModal"));

async function onLoadReview(mcId) {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }
  try {
    const res = await getReview({ token, mcId });
    console.log(res);
    $("#title").text(res.mc.title);
    $("#intro").text(res.mc.introduction);
    if (res.reviews.length == 0) {
      console.log("0");
      const starRatingHTML = `
                <span class="fa fa-star"></span>
                <span class="fa fa-star"></span>
                <span class="fa fa-star"></span>
                <span class="fa fa-star"></span>
                <span class="fa fa-star"></span>
            `;
      document.getElementById("rate-star").innerHTML += starRatingHTML;
      const scoreHTML = `<span>${res.rate}</span>`;
      document.getElementById("rate-star").innerHTML += scoreHTML;
    } else {
      let i = 0;
      document.getElementById("rate-star").innerHTML = "";
      for (i = 0; i <= res.rate - 1; i++) {
        const starRatingHTML = `
                <span class="fa fa-star check"></span>`;
        document.getElementById("rate-star").innerHTML += starRatingHTML;
      }
      while (i < 5) {
        const starRatingHTML = `
                <span class="fa fa-star"></span>`;
        document.getElementById("rate-star").innerHTML += starRatingHTML;
        i++;
      }
      const scoreHTML = `<span>${res.rate}</span>`;
      document.getElementById("rate-star").innerHTML += scoreHTML;
    }
    const reviews = res.reviews;
    const ul = document.getElementById("data-list");
    ul.innerHTML = "";
    reviews.forEach((review) => {
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
      const l2 = document.createElement("p");
      l2.textContent = `${review.content}`;
      component.appendChild(reviewContainer);
      component.appendChild(l2);
      ul.appendChild(component);
    });
  } catch (e) {
    console.log(e);
  }
}
function getSelectedRating() {
  const selectedInput = document.querySelector(
    '.rating input[name="rating"]:checked'
  );
  return selectedInput ? selectedInput.value : null;
}

async function onPostReview(mcId) {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) {
    location.href = "register.html";
  }
  try {
    const rate = getSelectedRating();
    const req = {
      content: $("#content").val(),
      rate: parseInt(rate),
      mcId: mcId
    };
    if (rate != null && req.content != null) {
      const res = await postReview({ token, req });
      console.log(res);
      await onLoadReview(mcId);
    }
    modalCreate.hide();
    document.getElementById("address-form").reset();
  } catch (e) {
    console.error(e);
    modalCreate.hide();
    document.getElementById("address-form").reset();
  }
}

$(document).ready(async () => {
  const mcId = parseQueryParameters(location.href).mcId;
  onLoadReview(mcId);
  $("#save-address").on("click", function (event) {
    event.preventDefault();
    onPostReview(mcId);
  });

  const socketSystem = io(NAMESPACE_SOCKET_IO_SYSTEM, {
    path: ENDPOINT_SOCKET_IO,
    auth: {
      token: localStorage.getItem(KEY_TOKEN)
    }
  });

  socketSystem.on("connect", () => {
    void banner.showSuccessMessage("Connected");
  });
});
