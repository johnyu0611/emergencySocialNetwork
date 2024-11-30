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
    const { userId } = socket.handshake.auth;

    try {
      const roomId = ChatroomIdSchema.parse(socket.handshake.query.roomId);
      socket.join(roomId);
      logger.info(
        { context: loggerContext },
        `User ${userId} joined room ${roomId}`
      );
    } catch (error) {
      logger.error({ context: loggerContext }, String(error));
      socket.disconnect(true);
    }
  }

  async function handleDisconnect(socket) {
    const loggerContext = "ChatroomChannelOnDisconnectHandler";
    const { userId } = socket.handshake.auth;
    logger.info({ context: loggerContext }, `User ${userId} disconnected`);
  }

  subChannel.on("connection", (socket) => {
    void handleConnect(socket);
    socket.on("disconnect", () => handleDisconnect(socket));
  });

  return subChannel;
}
