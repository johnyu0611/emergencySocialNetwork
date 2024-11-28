import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_RESOURCE } from "./endpoints.mjs";

export async function submitResource(payload, token, handlerMap = {}) {
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_RESOURCE,
    payload: payload,
    token,
    handlerMap,
    headers: {
      "Content-Type": "application/json" // Set Content-Type for JSON
    }
  });
}
