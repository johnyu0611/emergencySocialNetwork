import { authSocketIO } from "@/middleware/Auth.mjs";
import { logger } from "@/log/Logger.mjs";
import { ChatroomIdSchema } from "@/controller/schema/Common.mjs";
import { userDAO } from "@/database/UserDataAccess.mjs";

export function registerDirectoryChannel(io, jwt, namespace = "/directory") {
  const subChannel = io.of(namespace);
  subChannel.use(authSocketIO(jwt));

  function handleConnect(socket) {
    const loggerContext = "DirectoryOnConnectHandler";
    const { username } = socket.handshake.auth;
  }

  async function handleDisconnect(socket) {
    const loggerContext = "DirectoryOnDisconnectHandler";
    const { username } = socket.handshake.auth;
    console.log(username);
    await userDAO.getUserOffline({ username });
    logger.info({context: loggerContext}, `User ${username} disconnected`);
  }

  subChannel.on("connection", (socket) => {
    void handleConnect(socket);
    socket.on("disconnect", () => handleDisconnect(socket));
  });
}
