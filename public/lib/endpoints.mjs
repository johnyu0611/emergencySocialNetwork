export const API_ROOT = "/api";
export const ENDPOINT_USERS = `${API_ROOT}/users`;
export const ENDPOINT_USER_USERNAME = (userId) =>
  `${ENDPOINT_USERS}/${userId}/username`;
export const ENDPOINT_TOKENS = `${API_ROOT}/tokens`;
export const ENDPOINT_CHATROOM = `${API_ROOT}/chatrooms`;
export const ENDPOINT_STATUS = `${API_ROOT}/status`;
export const ENDPOINT_RESOURCE = `${API_ROOT}/resources`;
export const ENDPOINT_APPLICATIONS = `${API_ROOT}/applications`;
export const ENDPOINT_EMERGENCY_CONTACT = `${API_ROOT}/emergency-contact`;
export const ENDPOINT_EMERGENCY_HISTORY = `${API_ROOT}/emergency-history`;
export const ENDPOINT_CHATROOM_ID = (roomId) =>
  `${API_ROOT}/chatrooms/${roomId}`;
export const ENDPOINT_CHATROOM_MESSAGE = (roomId) =>
  `${ENDPOINT_CHATROOM_ID(roomId)}/messages`;
export const ENDPOINT_CHATROOM_MESSAGE_ID = (roomId, messageId) =>
  `${ENDPOINT_CHATROOM_MESSAGE(roomId)}/${messageId}`;
export const ENDPOINT_CHATROOM_STATUS = `${API_ROOT}/status-history`;

export const ENDPOINT_SYSTEM = `${API_ROOT}/system/state`;

export const ENDPOINT_LOCATION_SHARING_SESSIONS = `${API_ROOT}/location-sharing/sessions`;
export const ENDPOINT_LOCATION_SHARING_SESSION = (sessionId) =>
  `${ENDPOINT_LOCATION_SHARING_SESSIONS}/${sessionId}`;
export const ENDPOINT_LOCATION_SHARING_SESSION_USERS = (sessionId) =>
  `${ENDPOINT_LOCATION_SHARING_SESSIONS}/${sessionId}/users`;
export const ENDPOINT_LOCATION_SHARING_SESSION_USER_LOCATION = (
  sessionId,
  userId
) => `${ENDPOINT_LOCATION_SHARING_SESSION_USERS(sessionId)}/${userId}/location`;
export const ENDPOINT_LOCATION_SHARING_SESSIONS_USER_LAST_SEEN = (
  sessionId,
  userId
) =>
  `${ENDPOINT_LOCATION_SHARING_SESSION_USERS(sessionId)}/${userId}/last-seen`;
export const ENDPOINT_LOCATION_SHARING_SESSIONS_USER_RESOURCE_REQUEST = (
  sessionId,
  userId
) =>
  `${ENDPOINT_LOCATION_SHARING_SESSION_USERS(sessionId)}/${userId}/resource-request`;
export const ENDPOINT_LOCATION_SHARING_SESSIONS_USER_RESOURCE_RESPONSE = (
  sessionId,
  userId
) =>
  `${ENDPOINT_LOCATION_SHARING_SESSION_USERS(sessionId)}/${userId}/resource-response`;
export const ENDPOINT_LOCATION_SHARING_SESSION_USER_ROLE = (
  sessionId,
  userId
) => `${ENDPOINT_LOCATION_SHARING_SESSION_USERS(sessionId)}/${userId}/role`;

export const ENDPOINT_QUIZZES = `${API_ROOT}/quizzes`;
export const ENDPOINT_QUIZZES_CHALLENGES = `${API_ROOT}/quizzes/challenges`;

export const ENDPOINT_ADDRESS_VALIDATION =
  "https://addressvalidation.googleapis.com/v1:validateAddress?key=AIzaSyD8booOEHhBTnLL631xuNMJhKVB3eGi-Eg";

export const ENDPOINT_MEDICAL = `${API_ROOT}/medicalcenters`;

export const ENDPOINT_REVIEW = `${API_ROOT}/reviews`;

export const ENDPOINT_SOCKET_IO = `${API_ROOT}/socket.io`;

export const NAMESPACE_SOCKET_IO_CHATROOM = "/chatroom";
export const NAMESPACE_SOCKET_IO_LOCATION_SHARING = "/location-sharing";

export const NAMESPACE_SOCKET_IO_SYSTEM = "/system";
