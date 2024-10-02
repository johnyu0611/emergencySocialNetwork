import { callRestfulApiGet } from "./call-restful-api.mjs";
import { ENDPOINT_USERS } from "./endpoints.mjs";

export async function getESNDirectory({ token }, handlerMap = {}) {
  return await callRestfulApiGet({
    endpoint: ENDPOINT_USERS,
    payload: {},
    token,
    handlerMap: handlerMap
  });
}
