import { HTTPError } from "../common/errors.mjs"

export async function callRestfulApi({
  method,
  endpoint,
  payload,
  token,
  handlerMap
}) {
  const response = await fetch(endpoint, {
    method: method,
    headers: new Headers({
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : undefined
    }),
    body: JSON.stringify(payload)
  });

  return await handleRestfulResponse(response, handlerMap);
}

export async function callRestfulApiGet({
  endpoint,
  payload,
  token,
  handlerMap
}) {
  const query = `body=${encodeURIComponent(JSON.stringify(payload))}`;
  const response = await fetch(`${endpoint}?${query}`, {
    method: "GET",
    headers: new Headers({
      Authorization: token ? `Bearer ${token}` : undefined
    })
  });

  return await handleRestfulResponse(response, handlerMap);
}

async function handleRestfulResponse(response, handlerMap) {
  if (
    typeof handlerMap === "object" &&
    Object.hasOwn(handlerMap, response.status) &&
    typeof handlerMap[response.status] === "function"
  ) {
    return handlerMap[response.status](response);
  }

  if (response.ok) {
    return await response.json();
  }

  if (response.headers.get("Content-Type")?.includes("application/json")) {
    const data = await response.json();
    throw new HTTPError(response.status, data.reason ?? JSON.stringify(data));
  }
  throw new HTTPError(response.status, response.statusText);
}
