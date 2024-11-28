import { callRestfulApi, callRestfulApiGet } from "./call-restful-api.mjs";
import {
  ENDPOINT_LOCATION_SHARING_SESSIONS,
  ENDPOINT_LOCATION_SHARING_SESSION,
  ENDPOINT_LOCATION_SHARING_SESSIONS_USER_LAST_SEEN,
  ENDPOINT_LOCATION_SHARING_SESSION_USER_LOCATION,
  ENDPOINT_LOCATION_SHARING_SESSIONS_USER_RESOURCE_REQUEST,
  ENDPOINT_LOCATION_SHARING_SESSIONS_USER_RESOURCE_RESPONSE,
  ENDPOINT_LOCATION_SHARING_SESSION_USERS,
  ENDPOINT_USERS,
  ENDPOINT_LOCATION_SHARING_SESSION_USER_ROLE
} from "./endpoints.mjs";

export async function createLocationSharingSession(
  { token, location },
  handlerMap = {}
) {
  const payload = { location };
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_LOCATION_SHARING_SESSIONS,
    payload,
    token,
    handlerMap: handlerMap
  });
}

export async function deleteLocationSharingSession(
  { token, sessionId },
  handlerMap = {}
) {
  const payload = {};
  return await callRestfulApi({
    method: "DELETE",
    endpoint: ENDPOINT_LOCATION_SHARING_SESSION(sessionId),
    payload,
    token,
    handlerMap: handlerMap
  });
}

export async function getAllUsersInSession(
  { token, sessionId },
  handlerMap = {}
) {
  const payload = {};
  return await callRestfulApiGet({
    endpoint: ENDPOINT_LOCATION_SHARING_SESSION_USERS(sessionId),
    payload,
    token,
    handlerMap: handlerMap
  });
}

export async function addUserToSession(
  { token, sessionId, location },
  handlerMap = {}
) {
  const payload = { location };
  return await callRestfulApi({
    method: "POST",
    endpoint: ENDPOINT_LOCATION_SHARING_SESSION_USERS(sessionId),
    payload,
    token,
    handlerMap: handlerMap
  });
}

export async function getUserLocation(
  { token, sessionId, username },
  handlerMap = {}
) {
  const payload = {};
  return await callRestfulApiGet({
    endpoint: ENDPOINT_LOCATION_SHARING_SESSION_USER_LOCATION(
      sessionId,
      username
    ),
    payload,
    token,
    handlerMap: handlerMap
  });
}

export async function setUserLocation(
  { token, sessionId, username, location },
  handlerMap = {}
) {
  const payload = { location };
  return await callRestfulApi({
    method: "PUT",
    endpoint: ENDPOINT_LOCATION_SHARING_SESSION_USER_LOCATION(
      sessionId,
      username
    ),
    payload,
    token,
    handlerMap: handlerMap
  });
}

export async function getUserLastSeenTimestamp(
  { token, sessionId, username },
  handlerMap = {}
) {
  const payload = {};
  return await callRestfulApiGet({
    endpoint: ENDPOINT_LOCATION_SHARING_SESSIONS_USER_LAST_SEEN(
      sessionId,
      username
    ),
    payload,
    token,
    handlerMap: handlerMap
  });
}

export async function setUserLastSeenTimestamp(
  { token, sessionId, username, lastSeen },
  handlerMap = {}
) {
  const payload = { lastSeen };
  return await callRestfulApi({
    method: "PUT",
    endpoint: ENDPOINT_LOCATION_SHARING_SESSIONS_USER_LAST_SEEN(
      sessionId,
      username
    ),
    payload,
    token,
    handlerMap: handlerMap
  });
}

export async function getUserResourceRequest(
  { token, sessionId, username },
  handlerMap = {}
) {
  const payload = {};
  return await callRestfulApiGet({
    endpoint: ENDPOINT_LOCATION_SHARING_SESSIONS_USER_RESOURCE_REQUEST(
      sessionId,
      username
    ),
    payload,
    token,
    handlerMap: handlerMap
  });
}

export async function setUserResourceRequest(
  { token, sessionId, username, resourceRequest },
  handlerMap = {}
) {
  const payload = {
    resourceRequest
  };
  return await callRestfulApi({
    method: "PUT",
    endpoint: ENDPOINT_LOCATION_SHARING_SESSIONS_USER_RESOURCE_REQUEST(
      sessionId,
      username
    ),
    payload,
    token,
    handlerMap: handlerMap
  });
}

export async function getUserResourceResponse(
  { token, sessionId, username },
  handlerMap = {}
) {
  const payload = {};
  return await callRestfulApiGet({
    endpoint: ENDPOINT_LOCATION_SHARING_SESSIONS_USER_RESOURCE_RESPONSE(
      sessionId,
      username
    ),
    payload,
    token,
    handlerMap: handlerMap
  });
}

export async function setUserResourceResponse(
  { token, sessionId, username, resourceResponse },
  handlerMap = {}
) {
  const payload = {
    resourceResponse
  };
  return await callRestfulApi({
    method: "PUT",
    endpoint: ENDPOINT_LOCATION_SHARING_SESSIONS_USER_RESOURCE_RESPONSE(
      sessionId,
      username
    ),
    payload,
    token,
    handlerMap: handlerMap
  });
}

export async function getUserRole(
  { token, sessionId, username },
  handlerMap = {}
) {
  const payload = {};
  return await callRestfulApiGet({
    endpoint: ENDPOINT_LOCATION_SHARING_SESSION_USER_ROLE(sessionId, username),
    payload,
    token,
    handlerMap: handlerMap
  });
}

export async function setUserRole(
  { token, sessionId, username, role },
  handlerMap = {}
) {
  const payload = {
    role
  };
  return await callRestfulApi({
    method: "PUT",
    endpoint: ENDPOINT_LOCATION_SHARING_SESSION_USER_ROLE(sessionId, username),
    payload,
    token,
    handlerMap: handlerMap
  });
}

export async function getUserLocationSharingSession(
  { token, username },
  handlerMap = {}
) {
  const payload = {};
  return await callRestfulApiGet({
    endpoint: `${ENDPOINT_USERS}/${username}/location-sharing-session`,
    payload,
    token,
    handlerMap: handlerMap
  });
}

export async function setUserLocationSharingSession(
  { token, username, sessionId, role },
  handlerMap = {}
) {
  const payload = {
    id: sessionId,
    role: role
  };
  return await callRestfulApi({
    method: "PUT",
    endpoint: `${ENDPOINT_USERS}/${username}/location-sharing-session`,
    payload,
    token,
    handlerMap: handlerMap
  });
}
