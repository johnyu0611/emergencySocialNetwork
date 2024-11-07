import { callRestfulApiGet } from "./call-restful-api.mjs";
import { ENDPOINT_CHATROOM_STATUS } from "./endpoints.mjs";

export async function getHistoryStatus({ token, roomId }, handlerMap = {}) {
  const payload = {
    roomId
  };

  return await callRestfulApiGet({
    endpoint: ENDPOINT_CHATROOM_STATUS,
    payload,
    token,
    handlerMap: handlerMap
  });
}
