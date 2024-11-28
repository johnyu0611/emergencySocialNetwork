import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_EMERGENCY_HISTORY } from "./endpoints.mjs";

export async function postEmergencyHistory(
  { content, token },
  handlerMap = {}
) {
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_EMERGENCY_HISTORY,
    payload: {
      content
    },
    token,
    handlerMap: handlerMap
  });
}
