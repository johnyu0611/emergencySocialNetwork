export function searchUsers(sortedResults, resultsContainer) {
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
