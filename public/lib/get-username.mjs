import { callRestfulApiGet } from "./call-restful-api.mjs";
import { ENDPOINT_USER_USERNAME } from "./endpoints.mjs";

export async function getUsernameById({ token, userId }, handlerMap = {}) {
  return await callRestfulApiGet({
    endpoint: ENDPOINT_USER_USERNAME(userId),
    payload: {},
    token,
    handlerMap
  });
}
