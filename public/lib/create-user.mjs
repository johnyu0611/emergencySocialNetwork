import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_USERS } from "./endpoints.mjs";

export async function createUser({ username, password }, handlerMap = {}) {
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_USERS,
    payload: {
      username,
      password
    },
    handlerMap: handlerMap
  });
}
