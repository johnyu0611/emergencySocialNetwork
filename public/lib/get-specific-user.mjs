import { callRestfulApiGet } from "./call-restful-api.mjs";
import { ENDPOINT_ADMINISTRATOR } from "./endpoints.mjs";

export async function getSpecificUser({ token, userId }, handlerMap = {}) {
  const payload = {
    citizenId: Number(userId)
  };
  return await callRestfulApiGet({
    endpoint: ENDPOINT_ADMINISTRATOR,
    payload,
    token,
    handlerMap: handlerMap
  });
}
