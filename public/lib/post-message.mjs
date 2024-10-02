import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_CHATROOM_MESSAGE } from "./endpoints.mjs";

export async function postMessage({ roomId, content, token }, handlerMap = {}) {
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_CHATROOM_MESSAGE(roomId),
    payload: {
      content
    },
    token,
    handlerMap: handlerMap
  });
}
