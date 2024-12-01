import { JWT } from "@/auth/JWT.mjs";
import { config } from "@/config/Config.mjs";
import { MongoDBConnection } from "@/database/Connections.mjs";
import { logger } from "@/log/Logger.mjs";
import { registerRoutes } from "@/route/Register.mjs";
import { registerChannel } from "@/socket/Register.mjs";
import { PasswordHasher } from "@/util/PasswordHasher.mjs";
import cors from "cors";
import express from "express";
import { createServer as createHTTPServer } from "http";
import { createServer as createHTTPSServer } from "https";
import { createDefaultAdmin } from "@/util/CreateDefaultAdministrator.mjs";
import { Server } from "socket.io";
import bodyParser from "body-parser";
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

  // Set up HTTPS for development environment
  let server = undefined;
  if (config.environment.development === "true") {
    const key = fs.readFileSync("cert.key");
    const cert = fs.readFileSync("cert.crt");
    server = createHTTPSServer({ key, cert }, app);
  } else {
    server = createHTTPServer(app);
  }

  // Set up Socket.IO
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
  //adjust limit for image upload
  app.use(bodyParser.json({ limit: "10mb" }));

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

  await createDefaultAdmin(passwordHasher);

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
