import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_TOKENS } from "./endpoints.mjs";

export async function login({ username, password }, handlerMap = {}) {
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_TOKENS,
    payload: {
      username,
      password
    },
    handlerMap: handlerMap
  });
}
