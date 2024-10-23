import { ChatroomIdSchema } from "@/controller/schema/Common.mjs";
import { logger } from "@/log/Logger.mjs";
import { authSocketIO } from "@/middleware/Auth.mjs";
import { checkSystemStatusSocketIO } from "@/middleware/CheckSystemStatus.mjs";

export function registerChatroomChannel(io, jwt, namespace = "/chatroom") {
  const subChannel = io.of(namespace);
  subChannel.use(authSocketIO(jwt));
  subChannel.use(checkSystemStatusSocketIO());

  function handleConnect(socket) {
    const loggerContext = "ChatroomChannelOnConnectHandler";
    const { username } = socket.handshake.auth;

    try {
      const roomId = ChatroomIdSchema.parse(socket.handshake.query.roomId);
      socket.join(roomId);
      logger.info(
        { context: loggerContext },
        `User ${username} joined room ${roomId}`
      );
    } catch (error) {
      logger.error({ context: loggerContext }, String(error));
      socket.disconnect(true);
    }
  }

  async function handleDisconnect(socket) {
    const loggerContext = "ChatroomChannelOnDisconnectHandler";
    const { username } = socket.handshake.auth;
    logger.info({ context: loggerContext }, `User ${username} disconnected`);
  }

  subChannel.on("connection", (socket) => {
    void handleConnect(socket);
    socket.on("disconnect", () => handleDisconnect(socket));
  });

  return subChannel;
}
