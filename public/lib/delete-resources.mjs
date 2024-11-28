import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_RESOURCE } from "./endpoints.mjs";

export async function deleteResources(resourceId, token, handlerMap = {}) {
  return await callRestfulApi({
    method: "DELETE",
    endpoint: ENDPOINT_RESOURCE, // Do not append the ID to the endpoint
    token,
    payload: { id: resourceId }, // Include resource ID in the payload
    handlerMap,
    headers: {
      "Content-Type": "application/json" // Ensure content type for JSON payload
    }
  });
}
