import { callRestfulApiGet } from "./call-restful-api.mjs";
import { ENDPOINT_EMERGENCY_CONTACT } from "./endpoints.mjs";

export async function getEmergencyContact({ token }, handlerMap = {}) {
  return await callRestfulApiGet({
    endpoint: ENDPOINT_EMERGENCY_CONTACT,
    payload: {},
    token,
    handlerMap: handlerMap
  });
}
