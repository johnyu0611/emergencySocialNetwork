import { userDAO } from "@/database/UserDataAccess.mjs";
import { logger } from "@/log/Logger.mjs";
import { authSocketIO } from "@/middleware/Auth.mjs";

export function registerConnectedChannel(io, jwt, namespace = "/connected") {
  const subChannel = io.of(namespace);
  subChannel.use(authSocketIO(jwt));

  async function handleConnect(socket) {
    const loggerContext = "ConnectedOnConnectHandler";
    const { username } = socket.handshake.auth;
    await userDAO.getUserOnline({ username });
    subChannel.emit("join", username);
    logger.info({ context: loggerContext }, `User ${username} connected`);
  }

  async function handleDisconnect(socket) {
    const loggerContext = "ConnectedOnDisconnectHandler";
    const { username } = socket.handshake.auth;
    await userDAO.getUserOffline({ username });
    subChannel.emit("leave", username);
    logger.info({ context: loggerContext }, `User ${username} disconnected`);
  }

  subChannel.on("connection", (socket) => {
    void handleConnect(socket);
    socket.on("disconnect", () => handleDisconnect(socket));
  });

  return subChannel;
}
