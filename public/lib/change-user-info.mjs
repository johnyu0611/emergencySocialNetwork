import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_ADMINISTRATOR } from "./endpoints.mjs";

export async function changeUserInfo(
  {
    citizenId,
    validation,
    username = null,
    privilege = null,
    isActive = null,
    password = null,
    token
  },
  handlerMap = {}
) {
  const payload = {
    citizenId,
    validation,
    ...(privilege !== null && { privilege }),
    ...(username !== null && { username }),
    ...(isActive !== null && { isActive }),
    ...(password !== null && { password })
  };
  console.log(payload);
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_ADMINISTRATOR,
    payload,
    token,
    handlerMap: handlerMap
  });
}
