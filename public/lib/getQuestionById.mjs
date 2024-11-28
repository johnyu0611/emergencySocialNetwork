import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_QUIZZES } from "./endpoints.mjs";

export async function getQuestionByID({ questionID, token }, handlerMap = {}) {
  return await callRestfulApi({
    method: "GET",
    endpoint: `${ENDPOINT_QUIZZES}/${questionID}`,
    token,
    handlerMap
  });
}
