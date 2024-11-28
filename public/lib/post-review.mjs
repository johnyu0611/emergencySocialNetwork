import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_REVIEW } from "./endpoints.mjs";

export async function postReview({ req, token }, handlerMap = {}) {
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_REVIEW,
    payload: {
      content: req.content,
      rate: req.rate,
      mcId: req.mcId
    },
    token,
    handlerMap: handlerMap
  });
}
