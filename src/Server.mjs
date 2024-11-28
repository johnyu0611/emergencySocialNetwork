import { JWT } from "@/auth/JWT.mjs";
import { config } from "@/config/Config.mjs";
import { MongoDBConnection } from "@/database/Connections.mjs";
import { logger } from "@/log/Logger.mjs";
import { registerRoutes } from "@/route/Register.mjs";
import { registerChannel } from "@/socket/Register.mjs";
import { PasswordHasher } from "@/util/PasswordHasher.mjs";
import cors from "cors";
import express from "express";
import { createServer } from "https";
import { Server } from "socket.io";
import fs from "fs";

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
  const key = fs.readFileSync("cert.key");
  const cert = fs.readFileSync("cert.crt");

  const server = createServer({ key, cert }, app);
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

  // Create JWT instance
  const jwt = new JWT();

  // Create password hasher instance
  const passwordHasher = new PasswordHasher(config.security.passwordHash);

  const channel = registerChannel({ io, jwt });

  registerRoutes({ app, io, jwt, passwordHasher, channel });

  const port = config.environment.port || config.server.port;
  return server.listen(port, () => {
    logger.info(
      { context: loggerContext },
      `Server is listening at port ${port}`
    );
  });
}
