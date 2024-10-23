import { callRestfulApiGet } from "./call-restful-api.mjs";
import { ENDPOINT_CHATROOM } from "./endpoints.mjs";

export async function getChatroom({ token }, handlerMap = {}) {
  return await callRestfulApiGet({
    endpoint: ENDPOINT_CHATROOM,
    payload: {},
    token,
    handlerMap: handlerMap
  });
}
