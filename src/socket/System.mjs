import { logger } from "@/log/Logger.mjs";
import { authSocketIO } from "@/middleware/Auth.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import {
  CHANNEL_SYSTEM_EVENT_USER_JOIN,
  CHANNEL_SYSTEM_EVENT_USER_LEAVE
} from "@/util/Constants.mjs";

export function registerSystemChannel(io, jwt, namespace = "/system") {
  const subChannel = io.of(namespace);
  const userDAO = UserDataAccess.getInstance();
  subChannel.use(authSocketIO(jwt));

  async function handleConnect(socket) {
    const loggerContext = "SystemChannelOnConnectHandler";
    const { username } = socket.handshake.auth;

    try {
      await userDAO.update({ username }, { isOnline: true });
    } catch (error) {
      logger.warn(
        { context: loggerContext },
        "Cannot write online status to database. Please refer to the error below."
      );
      logger.warn({ context: loggerContext }, String(error));
    }

    subChannel.emit(CHANNEL_SYSTEM_EVENT_USER_JOIN, username);
    logger.info({ context: loggerContext }, `User ${username} connected`);
  }

  async function handleDisconnect(socket) {
    const loggerContext = "SystemChannelOnDisconnectHandler";
    const { username } = socket.handshake.auth;

    try {
      await userDAO.update({ username }, { isOnline: false });
    } catch (error) {
      logger.warn(
        { context: loggerContext },
        "Cannot write online status to database. Please refer to the error below."
      );
      logger.warn({ context: loggerContext }, String(error));
    }

    subChannel.emit(CHANNEL_SYSTEM_EVENT_USER_LEAVE, username);
    logger.info({ context: loggerContext }, `User ${username} disconnected`);
  }

  subChannel.on("connection", (socket) => {
    void handleConnect(socket);
    socket.on("disconnect", () => handleDisconnect(socket));
  });

  return subChannel;
}
