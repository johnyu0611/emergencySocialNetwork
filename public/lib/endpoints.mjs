export const API_ROOT = "/api";
export const ENDPOINT_USERS = `${API_ROOT}/users`;
export const ENDPOINT_TOKENS = `${API_ROOT}/tokens`;
export const ENDPOINT_CHATROOM = `${API_ROOT}/chatrooms`;
export const ENDPOINT_CHATROOM_ID = (roomId) => `${API_ROOT}/chatrooms/${roomId}`;
export const ENDPOINT_CHATROOM_MESSAGE = (roomId) => `${ENDPOINT_CHATROOM_ID(roomId)}/messages`;
export const ENDPOINT_CHATROOM_MESSAGE_ID = (roomId, messageId) => `${ENDPOINT_CHATROOM_MESSAGE(roomId)}/${messageId}`;

export const ENDPOINT_SOCKET_IO = `${API_ROOT}/socket.io`;

export const NAMESPACE_SOCKET_IO_CHATROOM = "/chatrooms";

export const NAMESPACE_SOCKET_IO_DIRECTORY = "/directory";
