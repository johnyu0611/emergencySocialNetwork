import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_EMERGENCY_HISTORY } from "./endpoints.mjs";

export async function deleteEmergencyHistory(
  { sender, timestamp, content, token },
  handlerMap = {}
) {
  return await callRestfulApi({
    method: "DELETE",
    endpoint: ENDPOINT_EMERGENCY_HISTORY,
    payload: {
      sender,
      timestamp,
      content
    },
    token,
    handlerMap: handlerMap
  });
}
