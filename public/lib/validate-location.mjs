import { callRestfulApiMap } from "./call-restful-api.mjs";
import { ENDPOINT_ADDRESS_VALIDATION } from "./endpoints.mjs";

export async function validateAddress({ address }, handlerMap = {}) {
  const payload = {
    address: {
      addressLines: address.addressLines,
      locality: address.city,
      administrativeArea: address.state,
      postalCode: address.postalCode,
      regionCode: address.country
    },
    enableUspsCass: false
  };

  return await callRestfulApiMap({
    method: "POST",
    endpoint: ENDPOINT_ADDRESS_VALIDATION,
    payload,
    handlerMap
  });
}
