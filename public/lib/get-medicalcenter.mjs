import { callRestfulApiGet } from "./call-restful-api.mjs";
import { ENDPOINT_MEDICAL } from "./endpoints.mjs";

export async function getMedicalCenter({ token }, handlerMap = {}) {
  return await callRestfulApiGet({
    endpoint: ENDPOINT_MEDICAL,
    payload: {},
    token,
    handlerMap: handlerMap
  });
}
