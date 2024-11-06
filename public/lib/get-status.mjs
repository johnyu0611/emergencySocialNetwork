import { callRestfulApiGet } from "./call-restful-api.mjs";
import { ENDPOINT_USERS } from "./endpoints.mjs";

export async function getStatus({ token, query }, handlerMap = {}) {
  const payload = {
    searchBy: {
      status: query
    }
  };
  return await callRestfulApiGet({
    endpoint: ENDPOINT_USERS,
    payload,
    token,
    handlerMap: handlerMap
  });
}
