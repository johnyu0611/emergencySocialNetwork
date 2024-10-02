import { callRestfulApiGet } from "./call-restful-api.mjs";
import { ENDPOINT_CHATROOM_MESSAGE } from "./endpoints.mjs";

export async function getHistoryMessages({token, roomId}, handlerMap = {}) {
  return await callRestfulApiGet({
    endpoint: ENDPOINT_CHATROOM_MESSAGE(roomId),
    payload: {},
    token,
    handlerMap: handlerMap
  });
}
