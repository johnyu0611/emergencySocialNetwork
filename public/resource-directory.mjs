import { Banner } from "./common/banner.mjs";
import { KEY_TOKEN } from "./common/constants.mjs";
import { logout } from "./lib/logout.mjs";
import { updateStatus as apiUpdateStatus } from "./lib/change-status.mjs";
import { performSearch } from "./common/perform-search.mjs";
import { submitResource } from "./lib/post-resources.mjs";
import { getResources } from "./lib/get-resources.mjs";
import { submitApplication } from "./lib/post-application.mjs";

const banner = new Banner($("#banner"));
const $buttonLogout = $("#button-logout");
const $statusButton = $("#share-status");
const $postResourceButton = $("#post-resource-button");
const $submitResourceButton = $("#submitResourceButton");
let statusModal, searchModal, postResourceModal, applicationModal;

async function onLogout() {
  banner.reset();
  $buttonLogout.prop("disabled", true);

  const token = localStorage.getItem(KEY_TOKEN);
  try {
    await logout({ token });
  } catch (e) {
    console.error(e);
  }

  postLogout();
}

function postLogout() {
  localStorage.removeItem(KEY_TOKEN);
  location.href = "index.html";
}

async function updateStatus(status) {
  console.log("User selected status:", status);

  const token = localStorage.getItem(KEY_TOKEN);

  if (!token) {
    console.error("No authorization token found.");
    void banner.showErrorMessage("You must log in first");
    return;
  }

  try {
    const response = await apiUpdateStatus({ status, token });
    void banner.showSuccessMessage(`Status updated to: ${response.status}`);
  } catch (error) {
    console.error("Error during status update:", error);
    if (error.response) {
      console.error("Response details:", error.response);
    }
    void banner.showErrorMessage("Failed to update status. Please try again.");
  }
}

// Initialize modals only if elements are found
function initializeModals() {
  if ($("#modal-status").length) {
    statusModal = new bootstrap.Modal($("#modal-status")[0]);
  }
  if ($("#resourceModal").length) {
    resourceModal = new bootstrap.Modal($("#resourceModal")[0]);
  }
  if ($("#modal-search").length) {
    searchModal = new bootstrap.Modal($("#modal-search")[0]);
  }
  if ($("#postResourceModal").length) {
    postResourceModal = new bootstrap.Modal($("#postResourceModal")[0]);
  }
  if ($("#applicationModal").length) {
    applicationModal = new bootstrap.Modal($("#applicationModal")[0]);
  }
}

// Open the Post Resource modal
function openResourceForm() {
  postResourceModal?.show();
}

async function submitResourceForm() {
  const name = $("#resourceName").val();
  const amount = parseInt($("#resourceAmount").val(), 10); // Parse as integer
  const description = $("#resourceDescription").val();
  const imageFile = $("#resourceImage")[0].files[0];
  const resourceType = $("input[name='resourceType']:checked").val(); // Get selected resource type
  const token = localStorage.getItem(KEY_TOKEN);

  if (!token) {
    console.error("No authorization token found.");
    alert("You must log in first.");
    return;
  }

  // Validate fields
  if (!name) {
    alert("Resource name is required.");
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  if (!resourceType) {
    alert("Please select whether this is a 'Provide' or 'Request' resource.");
    return;
  }

  // Prepare the JSON payload
  let payload = {
    name,
    amount,
    description,
    resourceType // Add the resource type to the payload
  };

  // Convert image to base64 if it exists
  if (imageFile) {
    try {
      const base64Image = await getBase64(imageFile);
      payload.imageBase64 = base64Image; // Add base64 image data to payload
      payload.imageType = imageFile.type; // Add MIME type, e.g., "image/png"
    } catch (error) {
      console.error("Error encoding image to base64:", error);
      alert("Failed to process image. Please try again.");
      return;
    }
  }

  try {
    // Send request with JSON payload
    await submitResource(payload, token);

    // Close the modal after submission
    postResourceModal.hide();

    // Clear the form after submission
    $("#resourceForm")[0].reset();

    // Display a success message

    location.reload();
  } catch (error) {
    console.error("Error posting resource:", error);
    alert("Failed to post resource. Please try again.");
  }
}

// Utility function to convert a file to a base64 string
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]); // Get base64 data
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

let allResources = []; // Array to store all fetched resources

// Function to render resources based on a filter
function renderResources(filterType = "all") {
  const resourceList = $("#resource-list");
  resourceList.empty();

  const filteredResources = allResources.filter((resource) => {
    const resourceData = resource._doc || resource; // Handle nested _doc case
    if (filterType === "provide")
      return resourceData.resourceType === "provide";
    if (filterType === "request")
      return resourceData.resourceType === "request";
    return true;
  });

  filteredResources.forEach((resource) => {
    const resourceData = resource._doc || resource; // Use _doc if present, fallback to resource

    const resourceContent = `
    <div class="resource-item ${resourceData.resourceType === "provide" ? "provide" : "request"} d-flex justify-content-between align-items-start">
      <div class="resource-details">
        <p><strong>Resource:</strong> ${resourceData.name || "N/A"}</p>
        <p><strong>Amount:</strong> ${resourceData.amount || "N/A"}</p>
        <p><strong>Posted by:</strong> ${resourceData.username || "N/A"}</p>
        <p><strong>Date Posted:</strong> ${resourceData.createdAt ? new Date(resourceData.createdAt).toLocaleDateString() : "N/A"}</p>
        <p><strong>Type:</strong> ${resourceData.resourceType === "provide" ? "Providing" : "Requesting"}</p>
      </div>
      ${
        resourceData.imageBase64 && resourceData.imageType
          ? `
        <img src="data:${resourceData.imageType};base64,${resourceData.imageBase64}" 
             alt="${resourceData.name}" 
             class="resource-image img-fluid" 
             style="max-width: 100px; height: auto; object-fit: cover; margin-left: 20px;" />
      `
          : ""
      }
      <div class="action-buttons mt-2">
        <button class="btn btn-${resourceData.resourceType === "provide" ? "primary" : "success"} btn-sm open-application-btn" 
                data-resource-id="${resourceData.id}" 
                data-resource-name="${resourceData.name}" 
                data-resource-owner="${resourceData.username}" 
                data-action-type="${resourceData.resourceType === "provide" ? "request" : "provide"}">
          ${resourceData.resourceType === "provide" ? "Request This Resource" : "Provide This Resource"}
        </button>
      </div>
    </div>
  `;
    resourceList.append(resourceContent);
  });
}

async function fetchAndDisplayResources() {
  const token = localStorage.getItem(KEY_TOKEN);
  const resourceList = document.getElementById("resource-list");

  resourceList.innerHTML = ""; // Clear the list before loading new resources

  try {
    const response = await getResources({ token });
    const data = response;
    allResources = data.resources; // Save fetched resources
    renderResources(); // Render all resources by default
  } catch (error) {
    console.error("Error fetching resources:", error);
  }
}

// Function to handle application submission
async function handleSubmitApplication() {
  // Get values from the modal
  const resourceId = $("#applicationModal").data("resource-id"); // Fetch resource ID
  const resourceName = $("#applicationResourceName").text();
  const resourceOwner = $("#applicationResourceOwner").text();
  const amount = parseInt($("#applicationAmount").val(), 10);
  const actionType = $("#applicationActionType").text().toLowerCase();
  const token = localStorage.getItem(KEY_TOKEN);

  // Validate input
  if (!amount || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  if (!resourceOwner) {
    alert("Resource owner information is missing.");
    return;
  }

  if (!token) {
    alert("You must be logged in to submit an application.");
    return;
  }

  // Prepare payload for API call
  const payload = {
    resourceId, // Include resource ID
    resourceName,
    resourceOwner,
    amount,
    actionType
  };

  try {
    // Call the API using submitApplication function
    await submitApplication(payload, token);

    // Clear the modal fields and hide the modal
    applicationModal.hide();
  } catch (error) {
    console.error("Error submitting application:", error);
    alert("Failed to submit application. Please try again.");
  }
}

$(document).ready(async () => {
  // Initialize modals after DOM is fully loaded
  initializeModals();
  fetchAndDisplayResources();
  // Logout button setup
  $buttonLogout.click(onLogout);

  // Status button and modal setup
  $statusButton.on("click", (event) => {
    event.preventDefault();
    statusModal?.show();
  });

  $("#modal-status .modal-body").on("click", ".status-btn", function () {
    const status = $(this).data("status");
    updateStatus(status);
    statusModal?.hide();
  });

  // Search button setup
  $("#button-search").on("click", (event) => {
    event.preventDefault();
    searchModal?.show();
    $("#searchResults").empty();
    $("#searchInput").val("");
  });

  $("#perform-search-button").on("click", () => {
    const selectedOption = $("input[name='searchOption']:checked").val();
    const query = $("#searchInput").val();
    const token = localStorage.getItem(KEY_TOKEN);
    if (!token) {
      location.href = "register.html";
      return;
    }

    performSearch(selectedOption, query, "resource-directory", token);
  });

  // Open Post Resource modal when button is clicked
  $postResourceButton.on("click", openResourceForm);

  // Handle the submission of the resource form
  $submitResourceButton.on("click", submitResourceForm);

  $("#filter-all").on("click", () => renderResources("all"));
  $("#filter-provide").on("click", () => renderResources("provide"));
  $("#filter-request").on("click", () => renderResources("request"));

  $("#resource-list").on("click", ".open-application-btn", function () {
    const resourceId = $(this).data("resource-id"); // Get resource ID
    const resourceName = $(this).data("resource-name");
    const resourceOwner = $(this).data("resource-owner"); // Get resource owner
    const actionType = $(this).data("action-type");

    // Populate the modal with relevant information
    $("#applicationResourceName").text(resourceName);
    $("#applicationResourceOwner").text(resourceOwner); // Set resource owner in modal
    $("#applicationActionType").text(actionType);

    // Attach resourceId to the modal for later use
    $("#applicationModal").data("resource-id", resourceId);

    // Show the application modal
    applicationModal?.show();
  });

  $("#submitApplicationButton").on("click", handleSubmitApplication);
});
