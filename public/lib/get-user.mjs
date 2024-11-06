import { callRestfulApiGet } from "./call-restful-api.mjs";
import { ENDPOINT_USERS } from "./endpoints.mjs";

export async function getUser({ token, query }, handlerMap = {}) {
  const payload = {
    searchBy: {
      username: query
    }
  };
  return await callRestfulApiGet({
    endpoint: ENDPOINT_USERS,
    payload,
    token,
    handlerMap: handlerMap
  });
}
