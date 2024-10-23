import { callRestfulApi } from "./call-restful-api.mjs";
import { ENDPOINT_SYSTEM } from "./endpoints.mjs";

// export async function changeSystemState({ duration, interval, token }, handlerMap = {}) {
//   return await callRestfulApi({
//     method: "PUT",
//     endpoint: ENDPOINT_SYSTEM,
//     payload: {
//       duration,
//       interval
//     },
//     token,
//     handlerMap: handlerMap
//   });
// }

export async function changeSystemState({ state, token }, handlerMap = {}) {
  return await callRestfulApi({
    method: "PUT",
    endpoint: ENDPOINT_SYSTEM,
    payload: {
      state
    },
    token,
    handlerMap: handlerMap
  });
}
