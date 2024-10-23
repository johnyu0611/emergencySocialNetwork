import { callRestfulApi, callRestfulApiGet } from "./call-restful-api.mjs";
import { ENDPOINT_CHATROOM_MESSAGE_ID } from "./endpoints.mjs";

export async function getMessageDetails(
  { roomId, messageId, token },
  handlerMap = {}
) {
  return await callRestfulApiGet({
    endpoint: ENDPOINT_CHATROOM_MESSAGE_ID(roomId, messageId),
    payload: {},
    token,
    handlerMap: handlerMap
  });
}
