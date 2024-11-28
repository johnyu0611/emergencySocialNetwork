import { LocationSharingSessionIdSchema } from "@/controller/schema/Common.mjs";
import { logger } from "@/log/Logger.mjs";
import { authSocketIO } from "@/middleware/Auth.mjs";
import { checkSystemStatusSocketIO } from "@/middleware/CheckSystemStatus.mjs";

export function registerLocationSharingChannel(
  io,
  jwt,
  namespace = "/location-sharing"
) {
  const subChannel = io.of(namespace);
  subChannel.use(authSocketIO(jwt));
  subChannel.use(checkSystemStatusSocketIO());

  function handleConnect(socket) {
    const loggerContext = "LocationSharingChannelOnConnectHandler";
    const { username } = socket.handshake.auth;

    try {
      const sessionId = LocationSharingSessionIdSchema.parse(
        socket.handshake.query.sessionId
      );
      socket.join(sessionId);
      logger.info(
        { context: loggerContext },
        `User ${username} joined location sharing session ${sessionId}`
      );
    } catch (error) {
      logger.error({ context: loggerContext }, String(error));
      socket.disconnect(true);
    }
  }

  async function handleDisconnect(socket) {
    const loggerContext = "LocationSharingChannelOnDisconnectHandler";
    const { username } = socket.handshake.auth;
    logger.info({ context: loggerContext }, `User ${username} disconnected`);
  }

  subChannel.on("connection", (socket) => {
    void handleConnect(socket);
    socket.on("disconnect", () => handleDisconnect(socket));
  });

  return subChannel;
}
