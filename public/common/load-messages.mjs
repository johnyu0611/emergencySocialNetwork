export function searchMessage(
  results,
  resultsContainer,
  loadMoreButton,
  currentPage,
  pageSize
) {
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
      timestamp.textContent = new Date(message.timestamp).toLocaleString();

      const messageContent = document.createElement("span");
      messageContent.textContent = " " + message.content;

      let iconHTML;
      console.log("message.status:", message);
      if (message.status === "OK") {
        iconHTML = `<i class="fa-solid fa-circle-check" style="color: green;"></i>`;
      } else if (message.status === "Help") {
        iconHTML = `<i class="fa-solid fa-circle-exclamation" style="color: #DAA520;"></i>`;
      } else if (message.status === "Emergency") {
        iconHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: red;"></i>`;
      }
      const statusContent = document.createElement("span");
      statusContent.style.marginLeft = "8px";
      if (iconHTML) {
        statusContent.innerHTML = iconHTML;
      }
      resultItem.appendChild(senderName);
      resultItem.appendChild(statusContent);
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

  return currentPage;
}
