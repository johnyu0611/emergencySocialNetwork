import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_MEDICAL } from "./endpoints.mjs";

export async function deleteMedicalCenter({ id, token }, handlerMap = {}) {
  return await callRestfulApi({
    method: "DELETE",
    endpoint: ENDPOINT_MEDICAL,
    payload: {
      mcId: id
    },
    token,
    handlerMap: handlerMap
  });
}
