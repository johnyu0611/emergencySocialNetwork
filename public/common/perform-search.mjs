import { getHistoryMessages } from "../lib/get-history-messages.mjs";
import { getUser } from "../lib/get-user.mjs";
import { getStatus } from "../lib/get-status.mjs";
import { checkStopWords } from "../lib/check-stop-words.mjs";
import { searchMessage } from "./load-messages.mjs";
import { searchStatus } from "./load-status.mjs";
import { searchUsers } from "./load-users.mjs";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function performSearch(
  selectedOption,
  query,
  roomId,
  token,
  stopSearchState
) {
  let results = [];
  let currentPage = 0;
  const pageSize = 10;

  const resultsContainer = document.getElementById("searchResults");
  const loadMoreButton = document.getElementById("loadMoreButton");
  resultsContainer.innerHTML = "";

  if (checkStopWords(query)) {
    resultsContainer.textContent = "No results found.";
    loadMoreButton.style.display = "none";
    return;
  }

  try {
    if (stopSearchState.isSearchStopped) {
      console.log("Search stopped.");
      return;
    }

    if (selectedOption === "message") {
      const response = await getHistoryMessages({ token, roomId, query });
      await sleep(2000); // wait for 2 seconds before proceeding
      results = response.messages.reverse();

      const loadMessages = () => {
        if (stopSearchState.isSearchStopped) {
          console.log("Search stopped.");
          return;
        }
        currentPage = searchMessage(
          results,
          resultsContainer,
          loadMoreButton,
          currentPage,
          pageSize
        );
      };

      loadMessages();

      loadMoreButton.removeEventListener("click", loadMessages);
      loadMoreButton.addEventListener("click", loadMessages);
    }

    if (selectedOption === "status") {
      const response = await getStatus({ token, query });
      if (stopSearchState.isSearchStopped) {
        console.log("Search stopped.");
        return;
      }
      results = response.users;
      const sortedResults = results.sort((a, b) => {
        if (a.isOnline === true && b.isOnline === false) {
          return -1;
        }
        if (a.isOnline === false && b.isOnline === true) {
          return 1;
        }
        return a.username.localeCompare(b.username);
      });

      searchStatus(sortedResults, resultsContainer);
    }

    if (selectedOption === "user") {
      const response = await getUser({ token, query });
      if (stopSearchState.isSearchStopped) {
        console.log("Search stopped.");
        return;
      }
      results = response.users;
      const sortedResults = results.sort((a, b) => {
        if (a.isOnline === true && b.isOnline === false) {
          return -1;
        }
        if (a.isOnline === false && b.isOnline === true) {
          return 1;
        }
        return a.username.localeCompare(b.username);
      });

      searchUsers(sortedResults, resultsContainer);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred during the search.");
  }
}
