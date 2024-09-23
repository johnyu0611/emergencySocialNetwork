import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_USERNAME } from "./endpoints.mjs";

export async function verify({ username, password }, handlerMap = {}) {
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_USERNAME,
    payload: {
      username,
      password
    },
    handlerMap: handlerMap
  });
}
