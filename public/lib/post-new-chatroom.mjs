import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_CHATROOM } from "./endpoints.mjs";

export async function postChatroom({ title, token }, handlerMap = {}) {
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_CHATROOM,
    payload: {
      receiver: title
    },
    token,
    handlerMap: handlerMap
  });
}
