import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_RESOURCE } from "./endpoints.mjs";

export async function patchResources(
  resourceId,
  updatedData,
  token,
  handlerMap = {}
) {
  return await callRestfulApi({
    method: "PATCH",
    endpoint: ENDPOINT_RESOURCE, // Ensure this matches your backend routing
    token,
    payload: {
      id: resourceId, // Include resource ID in the payload
      ...updatedData // Include the fields to update
    },
    handlerMap,
    headers: {
      "Content-Type": "application/json" // Ensure content type for JSON payload
    }
  });
}
