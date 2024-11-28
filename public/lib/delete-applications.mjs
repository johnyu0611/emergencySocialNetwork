import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_APPLICATIONS } from "./endpoints.mjs";

export async function deleteApplications(
  applicationId,
  token,
  handlerMap = {}
) {
  return await callRestfulApi({
    method: "DELETE",
    endpoint: ENDPOINT_APPLICATIONS, // Do not append the ID to the endpoint
    token,
    payload: { id: applicationId }, // Include applicationId in the payload
    handlerMap,
    headers: {
      "Content-Type": "application/json" // Ensure content type for JSON payload
    }
  });
}
