import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_QUIZZES_CHALLENGES } from "./endpoints.mjs";

export async function acceptChallenge({ payload, token }, handlerMap = {}) {
  return await callRestfulApi({
    method: "PUT",
    endpoint: ENDPOINT_QUIZZES_CHALLENGES,
    payload,
    token,
    handlerMap
  });
}
