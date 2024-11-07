fetch("component/search-box.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("modal-container-search").innerHTML = data;
  })
  .catch((error) => console.error("Error loading modal:", error));
