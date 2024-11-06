import { getHistoryMessages } from "../lib/get-history-messages.mjs";
import { getUser } from "../lib/get-user.mjs";
import { getStatus } from "../lib/get-status.mjs";

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

  const stopWords = [
    "a",
    "able",
    "about",
    "across",
    "after",
    "all",
    "almost",
    "also",
    "am",
    "among",
    "an",
    "and",
    "any",
    "are",
    "as",
    "at",
    "be",
    "because",
    "been",
    "but",
    "by",
    "can",
    "cannot",
    "could",
    "dear",
    "did",
    "do",
    "does",
    "either",
    "else",
    "ever",
    "every",
    "for",
    "from",
    "get",
    "got",
    "had",
    "has",
    "have",
    "he",
    "her",
    "hers",
    "him",
    "his",
    "how",
    "however",
    "i",
    "if",
    "in",
    "into",
    "is",
    "it",
    "its",
    "just",
    "least",
    "let",
    "like",
    "likely",
    "may",
    "me",
    "might",
    "most",
    "must",
    "my",
    "neither",
    "no",
    "nor",
    "not",
    "of",
    "off",
    "often",
    "on",
    "only",
    "or",
    "other",
    "our",
    "own",
    "rather",
    "said",
    "say",
    "says",
    "she",
    "should",
    "since",
    "so",
    "some",
    "than",
    "that",
    "the",
    "their",
    "them",
    "then",
    "there",
    "these",
    "they",
    "this",
    "tis",
    "to",
    "too",
    "twas",
    "us",
    "wants",
    "was",
    "we",
    "were",
    "what",
    "when",
    "where",
    "which",
    "while",
    "who",
    "whom",
    "why",
    "will",
    "with",
    "would",
    "yet",
    "you",
    "your"
  ];

  if (stopWords.includes(query)) {
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
        const start = currentPage * pageSize;
        const end = start + pageSize;
        const messagesToShow = results.slice(start, end);

        if (messagesToShow.length > 0) {
          messagesToShow.forEach((message) => {
            const resultItem = document.createElement("div");
            resultItem.classList.add(
              "result-item",
              "mb-2",
              "p-2",
              "border",
              "rounded"
            );

            const senderName = document.createElement("strong");
            senderName.textContent = message.sender;

            const timestamp = document.createElement("small");
            timestamp.classList.add("text-muted", "ms-2");
            timestamp.textContent = new Date(
              message.timestamp
            ).toLocaleString();

            const messageContent = document.createElement("span");
            messageContent.textContent = " " + message.content;

            resultItem.appendChild(senderName);
            resultItem.appendChild(timestamp);
            resultItem.appendChild(messageContent);
            resultsContainer.appendChild(resultItem);
          });

          currentPage++;
          loadMoreButton.style.display =
            results.length > end ? "inline-block" : "none";
        } else if (currentPage === 0) {
          resultsContainer.textContent = "No results found.";
          loadMoreButton.style.display = "none";
        }
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

      if (sortedResults.length > 0) {
        sortedResults.forEach((user) => {
          const resultItem = document.createElement("div");
          resultItem.classList.add(
            "result-item",
            "mb-2",
            "p-2",
            "border",
            "rounded"
          );
          resultItem.textContent = user.username;
          resultItem.style.display = "flex";
          resultItem.style.justifyContent = "space-between";
          resultItem.style.alignItems = "center";
          resultItem.style.color = user.isOnline === true ? "green" : "grey";
          resultItem.style.color = user.isOnline === true ? "green" : "grey";

          const statusDot = document.createElement("span");
          statusDot.style.width = "10px";
          statusDot.style.height = "10px";
          statusDot.style.borderRadius = "50%";
          statusDot.style.display = "inline-block";
          statusDot.style.marginLeft = "5px";
          statusDot.style.backgroundColor = user.isOnline ? "green" : "gray";

          const userStatusSpan = document.createElement("span");
          const userStatusIcon = document.createElement("i");

          if (user.status === "OK") {
            userStatusIcon.classList.add("fa-solid", "fa-circle-check");
            userStatusSpan.style.color = "green";
            userStatusSpan.textContent = " OK";
          } else if (user.status === "Help") {
            userStatusIcon.classList.add("fa-solid", "fa-circle-exclamation");
            userStatusSpan.style.color = "#DAA520";
            userStatusSpan.textContent = " Help";
          } else if (user.status === "Emergency") {
            userStatusIcon.classList.add("fa-solid", "fa-triangle-exclamation");
            userStatusSpan.style.color = "red";
            userStatusSpan.textContent = " Emergency";
          }

          userStatusSpan.style.marginLeft = "10px";
          userStatusSpan.prepend(userStatusIcon);

          resultItem.append(userStatusSpan);
          resultItem.appendChild(statusDot);
          resultsContainer.appendChild(resultItem);
        });
      } else {
        resultsContainer.textContent = "No citizens found.";
      }
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

      if (sortedResults.length > 0) {
        sortedResults.forEach((user) => {
          const resultItem = document.createElement("div");
          resultItem.classList.add(
            "result-item",
            "mb-2",
            "p-2",
            "border",
            "rounded"
          );
          resultItem.textContent = user.username;
          resultItem.style.display = "flex";
          resultItem.style.justifyContent = "space-between";
          resultItem.style.alignItems = "center";
          resultItem.style.color = user.isOnline === true ? "green" : "grey";
          resultItem.style.color = user.isOnline === true ? "green" : "grey";

          const statusDot = document.createElement("span");
          statusDot.style.width = "10px";
          statusDot.style.height = "10px";
          statusDot.style.borderRadius = "50%";
          statusDot.style.display = "inline-block";
          statusDot.style.marginLeft = "5px";
          statusDot.style.backgroundColor = user.isOnline ? "green" : "gray";

          const userStatusSpan = document.createElement("span");
          const userStatusIcon = document.createElement("i");

          if (user.status === "OK") {
            userStatusIcon.classList.add("fa-solid", "fa-circle-check");
            userStatusSpan.style.color = "green";
            userStatusSpan.textContent = " OK";
          } else if (user.status === "Help") {
            userStatusIcon.classList.add("fa-solid", "fa-circle-exclamation");
            userStatusSpan.style.color = "#DAA520";
            userStatusSpan.textContent = " Help";
          } else if (user.status === "Emergency") {
            userStatusIcon.classList.add("fa-solid", "fa-triangle-exclamation");
            userStatusSpan.style.color = "red";
            userStatusSpan.textContent = " Emergency";
          }

          userStatusSpan.style.marginLeft = "10px";
          userStatusSpan.prepend(userStatusIcon);

          resultItem.append(userStatusSpan);
          resultItem.appendChild(statusDot);
          resultsContainer.appendChild(resultItem);
        });
      } else {
        resultsContainer.textContent = "No results found.";
      }
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred during the search.");
  }
}
