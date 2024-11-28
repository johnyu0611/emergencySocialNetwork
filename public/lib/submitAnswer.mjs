import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_QUIZZES } from "./endpoints.mjs";

export async function submitAnswer({ payload, token }, handlerMap = {}) {
  return await callRestfulApi({
    method: "POST",
    endpoint: `${ENDPOINT_QUIZZES}/${payload.questionID}`,
    payload,
    token,
    handlerMap
  });
}
