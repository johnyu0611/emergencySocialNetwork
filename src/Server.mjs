import { JWT } from "@/auth/JWT.mjs";
import { config } from "@/config/Config.mjs";
import { MongoDBConnection } from "@/database/Connections.mjs";
import { logger } from "@/log/Logger.mjs";
import { registerRoutes } from "@/route/Register.mjs";
import { registerChatroomChannel } from "@/socket/RegisterChatroomChannel.mjs";
import { registerConnectedChannel } from "@/socket/RegisterConnectedChannel.mjs";
import { PasswordHasher } from "@/util/PasswordHasher.mjs";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const loggerContext = "Server";

export async function runServer() {
  logger.debug({ context: loggerContext }, "Setting up Server");
  const app = express();

  // Set up static assets
  app.use(express.static(config.server.staticFolder));
  logger.debug(
    { context: loggerContext },
    `Static assets served from ${config.server.staticFolder}`
  );

  // Set up Socket.IO
  const server = createServer(app);
  const io = new Server(server, {
    path: `${config.server.apiBasePath}/socket.io/`
  });
  logger.debug(
    { context: loggerContext },
    `Socket.IO set up at ${config.server.apiBasePath}/socket.io/`
  );

  // Set up CORS
  if (config.environment.development === "true") {
    app.use(cors());
    logger.warn({ context: loggerContext }, "CORS middleware enabled globally");
  }

  // Set up MongoDB
  await MongoDBConnection.connect(
    config.environment.databaseUser,
    config.environment.databasePassword,
    config.environment.databaseCluster,
    config.environment.databaseName,
    config.environment.databaseAppName
  );
  // await mongoose.connect(
  //   [
  //     "mongodb+srv://",
  //     `${config.environment.databaseUser}:${config.environment.databasePassword}`,
  //     `@${config.environment.databaseCluster}/${config.environment.databaseName}`,
  //     `?retryWrites=true&w=majority&appName=${config.environment.databaseAppName}`
  //   ].join("")
  // );
  // logger.info(
  //   { context: loggerContext },
  //   `Connected to MongoDB as ${config.environment.databaseUser}`
  // );

  // Create JWT instance
  const jwt = new JWT();

  // Create password hasher instance
  const passwordHasher = new PasswordHasher(config.security.passwordHash);

  const chatroomChannel = registerChatroomChannel(io, jwt);
  registerRoutes({ app, io, jwt, passwordHasher, chatroomChannel });
  registerConnectedChannel(io, jwt);

  const { port } = config.server;
  server.listen(port, () => {
    logger.info(
      { context: loggerContext },
      "Server is listening at port %d",
      port
    );
  });
}
