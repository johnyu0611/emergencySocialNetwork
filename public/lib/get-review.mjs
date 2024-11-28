import { callRestfulApiGet } from "./call-restful-api.mjs";
import { ENDPOINT_REVIEW } from "./endpoints.mjs";

export async function getReview({ token, mcId }, handlerMap = {}) {
  return await callRestfulApiGet({
    endpoint: ENDPOINT_REVIEW,
    payload: {
      mcId
    },
    token,
    handlerMap: handlerMap
  });
}
