import { callRestfulApiGet } from "./call-restful-api.mjs";
import { ENDPOINT_EMERGENCY_HISTORY } from "./endpoints.mjs";

export async function getEmergencyHistory({ who, token }, handlerMap = {}) {
  return await callRestfulApiGet({
    endpoint: ENDPOINT_EMERGENCY_HISTORY,
    payload: {
      who
    },
    token,
    handlerMap: handlerMap
  });
}
