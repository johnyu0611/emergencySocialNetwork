import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_STATUS } from "./endpoints.mjs";

export async function updateStatus({ status, token }, handlerMap = {}) {
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_STATUS,
    payload: {
      status
    },
    token,
    handlerMap: handlerMap
  });
}
