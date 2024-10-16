import { logger } from "@/log/Logger.mjs";
import { authSocketIO } from "@/middleware/Auth.mjs";
import { UserDataAccess } from "@/model/User.mjs";

export function registerConnectedChannel(io, jwt, namespace = "/connected") {
  const subChannel = io.of(namespace);
  const userDAO = UserDataAccess.getInstance();
  subChannel.use(authSocketIO(jwt));

  async function handleConnect(socket) {
    const loggerContext = "ConnectedOnConnectHandler";
    const { username } = socket.handshake.auth;
    await userDAO.update({ username }, { isOnline: true });
    subChannel.emit("join", username);
    logger.info({ context: loggerContext }, `User ${username} connected`);
  }

  async function handleDisconnect(socket) {
    const loggerContext = "ConnectedOnDisconnectHandler";
    const { username } = socket.handshake.auth;
    await userDAO.update({ username }, { isOnline: false });
    subChannel.emit("leave", username);
    logger.info({ context: loggerContext }, `User ${username} disconnected`);
  }

  subChannel.on("connection", (socket) => {
    void handleConnect(socket);
    socket.on("disconnect", () => handleDisconnect(socket));
  });

  return subChannel;
}
