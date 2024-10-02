import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_TOKENS } from "./endpoints.mjs";

export async function logout({ token }, handlerMap = {}) {
  return await callRestfulApi({
    method: "DELETE",
    endpoint: ENDPOINT_TOKENS,
    payload: {},
    token,
    handlerMap: handlerMap
  });
}
