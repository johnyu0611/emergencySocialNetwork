import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_QUIZZES_CHALLENGES } from "./endpoints.mjs";

export async function sendChallenge({ payload, token }, handlerMap = {}) {
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_QUIZZES_CHALLENGES,
    payload,
    token,
    handlerMap: handlerMap
  });
}
