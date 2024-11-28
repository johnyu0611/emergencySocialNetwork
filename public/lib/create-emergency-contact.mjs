import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_EMERGENCY_CONTACT } from "./endpoints.mjs";

export async function updateEmergencyContact(
  { fullName, username, email, token },
  handlerMap = {}
) {
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_EMERGENCY_CONTACT,
    payload: {
      emergencyContact: {
        username,
        fullName,
        email
      }
    },
    token,
    handlerMap: handlerMap
  });
}
