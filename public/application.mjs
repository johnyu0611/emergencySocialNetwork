import { KEY_TOKEN } from "./common/constants.mjs";
import { Banner } from "./common/banner.mjs";
import { getAllApplications } from "./lib/get-applications.mjs";
import { deleteApplications } from "./lib/delete-applications.mjs";
import { getResources } from "./lib/get-resources.mjs";
import { patchResources } from "./lib/patch-resource.mjs";
import { deleteResources } from "./lib/delete-resources.mjs";
import { getUsernameById } from "./lib/get-username.mjs";

const banner = new Banner($("#banner"));
let applicationList = [];

//TO DO: either use sessionStorahe or move this to util
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1]; // Get the Payload part
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Replace URL-safe characters
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload); // Parse the JSON payload
  } catch (error) {
    console.error("Failed to parse JWT:", error);
    return null;
  }
}

async function fetchAndDisplayApplications() {
  const token = localStorage.getItem(KEY_TOKEN);

  if (!token) {
    banner.showErrorMessage("You must be logged in to view applications.");
    return;
  }

  // Extract username from the token
  const payload = parseJwt(token);
  const userId = payload?.userId || payload?.sub; // Adjust based on your token's structure

  if (!userId) {
    banner.showErrorMessage("Invalid token. Unable to retrieve username.");
    return;
  }

  try {
    const response = await getAllApplications(token);
    const applications = response.applications;

    // Filter applications for resources owned by the logged-in user
    applicationList = applications.filter(
      (app) => app.resourceOwnerId === userId
    );

    renderApplications(applicationList);
  } catch (error) {
    console.error("Error fetching applications:", error);
    banner.showErrorMessage("Failed to load applications. Please try again.");
  }
}

async function renderApplications(applications) {
  const token = localStorage.getItem(KEY_TOKEN);
  const applicationListElement = $("#application-list");
  applicationListElement.empty();

  if (applications.length === 0) {
    applicationListElement.append(
      `<li class="list-group-item">No applications found.</li>`
    );
    return;
  }

  for (const app of applications) {
    try {
      const response = await getUsernameById({
        token,
        userId: app.applicantUserId
      });
      const applicantUsername = response.username;
      const applicationContent = `
          <li class="list-group-item application-item">
              <p><strong>Resource:</strong> ${app.resourceName}</p>
              <p><strong>Amount:</strong> ${app.amount}</p>
              <p><strong>from:</strong> ${applicantUsername}</p>
              <p><strong>Action:</strong> ${app.actionType === "provide" ? "Provide" : "Request"}</p>
              <p><strong>Date:</strong> ${new Date(app.createdAt).toLocaleDateString()}</p>
              <div class="action-buttons mt-2">
              <button 
                  class="btn btn-success btn-sm accept-button" 
                  data-id="${app.id}" 
                  data-resource-id="${app.resourceId}" 
                  data-amount="${app.amount}">
                  Accept
              </button>
              <button class="btn btn-danger btn-sm decline-button" data-id="${app.id}">Decline</button>
              </div>
          </li>
          `;
      applicationListElement.append(applicationContent);
    } catch (error) {
      console.error(
        `Failed to fetch username for application ID ${app.id}:`,
        error
      );
    }
  }

  // Add event listeners after rendering all applications
  $(".accept-button").on("click", handleAccept);
  $(".decline-button").on("click", handleDecline);
}

async function handleAccept(event) {
  const applicationId = $(event.target).data("id");
  const resourceId = $(event.target).data("resource-id");
  const requestedAmount = $(event.target).data("amount"); // Amount requested by the application
  const token = localStorage.getItem(KEY_TOKEN);

  try {
    // Fetch resource details
    const resourceResponse = await getResources({ token, resourceId });
    const resource = resourceResponse.resources[0]; // Assuming the response contains an array of resources

    if (!resource) {
      throw new Error(`Resource with ID ${resourceId} not found`);
    }

    // Calculate updated amount
    const updatedAmount = resource.amount - requestedAmount;

    if (updatedAmount < 1) {
      // Delete the resource if fully consumed
      await deleteResources(resourceId, token, {
        404: () => alert(`Resource "${resource.name}" not found.`),
        500: () => alert("Server error while deleting the resource.")
      });
    } else {
      // Update the resource amount
      await patchResources(resourceId, { amount: updatedAmount }, token, {
        400: () => alert("Invalid request to update the resource."),
        500: () => alert("Server error while updating the resource.")
      });
    }

    // Delete the application
    await deleteApplications(applicationId, token, {
      200: () =>
        console.log(
          `Application ${applicationId} successfully removed from the database.`
        ),
      404: () => console.error(`Application ${applicationId} not found.`),
      500: () =>
        console.error(
          `Server error while removing application ${applicationId}.`
        )
    });

    // Remove the application from the UI
    $(`.accept-button[data-id="${applicationId}"]`).closest("li").remove();
  } catch (error) {
    console.error("Error accepting application:", error);
    alert("Failed to accept application. Please try again.");
  }
}

async function handleDecline(event) {
  const applicationId = $(event.target).data("id");
  const token = localStorage.getItem(KEY_TOKEN); // Assume the token is stored in localStorage

  try {
    console.log(`Declining application ${applicationId}...`);

    const response = await deleteApplications(applicationId, token, {
      200: () => console.log("Application successfully declined and removed."),
      404: () => console.error("Application not found."),
      500: () => console.error("Server error while declining application.")
    });

    // Optionally, remove the application from the UI
    $(`#application-${applicationId}`).remove(); // Adjust selector as needed

    fetchAndDisplayApplications();
  } catch (error) {
    console.error(`Failed to decline application ${applicationId}:`, error);
  }
}

$(document).ready(() => {
  fetchAndDisplayApplications();
});
