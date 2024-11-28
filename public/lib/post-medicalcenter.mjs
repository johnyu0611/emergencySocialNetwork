import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_MEDICAL } from "./endpoints.mjs";

export async function postMedical({ req, token }, handlerMap = {}) {
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_MEDICAL,
    payload: {
      location: req.location,
      title: req.title,
      introduction: req.introduction,
      address: req.address
    },
    token,
    handlerMap: handlerMap
  });
}
