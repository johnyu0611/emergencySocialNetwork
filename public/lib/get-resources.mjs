import { callRestfulApiGet } from "./call-restful-api.mjs";
import { ENDPOINT_RESOURCE } from "./endpoints.mjs";

export async function getResources(
  { token, resourceId = null },
  handlerMap = {}
) {
  const payload = resourceId ? { searchBy: { resourceId } } : {};
  return await callRestfulApiGet({
    endpoint: ENDPOINT_RESOURCE,
    payload, // Include the payload with optional resourceId
    token,
    handlerMap
  });
}
