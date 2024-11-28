export const API_ROOT = "/api";
export const ENDPOINT_USERS = `${API_ROOT}/users`;
export const ENDPOINT_TOKENS = `${API_ROOT}/tokens`;
export const ENDPOINT_CHATROOM = `${API_ROOT}/chatrooms`;
export const ENDPOINT_STATUS = `${API_ROOT}/status`;
export const ENDPOINT_EMERGENCY_CONTACT = `${API_ROOT}/emergency-contact`;
export const ENDPOINT_EMERGENCY_HISTORY = `${API_ROOT}/emergency-history`;
export const ENDPOINT_CHATROOM_ID = (roomId) =>
  `${API_ROOT}/chatrooms/${roomId}`;
export const ENDPOINT_CHATROOM_MESSAGE = (roomId) =>
  `${ENDPOINT_CHATROOM_ID(roomId)}/messages`;
export const ENDPOINT_CHATROOM_MESSAGE_ID = (roomId, messageId) =>
  `${ENDPOINT_CHATROOM_MESSAGE(roomId)}/${messageId}`;
export const ENDPOINT_CHATROOM_STATUS = `${API_ROOT}/status-history`;

// endpoints added for esn speed test
export const ENDPOINT_SYSTEM = `${API_ROOT}/system/state`;
// export const ENDPOINT_SYSTEM_STATE = (state) =>
//   `${API_ROOT}/system/${state}`;

export const ENDPOINT_QUIZZES = `${API_ROOT}/quizzes`;
export const ENDPOINT_QUIZZES_CHALLENGES = `${API_ROOT}/quizzes/challenges`;

export const ENDPOINT_SOCKET_IO = `${API_ROOT}/socket.io`;

export const NAMESPACE_SOCKET_IO_CHATROOM = "/chatroom";

export const NAMESPACE_SOCKET_IO_SYSTEM = "/system";
