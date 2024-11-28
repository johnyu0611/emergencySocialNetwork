import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_APPLICATIONS } from "./endpoints.mjs";

export async function getAllApplications(token, handlerMap = {}) {
  return await callRestfulApi({
    method: "GET",
    endpoint: ENDPOINT_APPLICATIONS,
    token,
    handlerMap
  });
}
