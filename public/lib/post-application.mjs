import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_APPLICATIONS } from "./endpoints.mjs";

export async function submitApplication(payload, token, handlerMap = {}) {
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_APPLICATIONS,
    payload: payload,
    token,
    handlerMap,
    headers: {
      "Content-Type": "application/json" // Set Content-Type for JSON
    }
  });
}
