import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_MEDICAL } from "./endpoints.mjs";

export async function updateMedical(
  { introduction, mcId, token },
  handlerMap = {}
) {
  return await callRestfulApi({
    method: "PUT",
    endpoint: ENDPOINT_MEDICAL,
    payload: {
      introduction: introduction,
      mcId: mcId
    },
    token,
    handlerMap: handlerMap
  });
}
