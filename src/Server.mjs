import cors from "cors";
import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { logger } from "@/log/Logger.mjs";
import { config } from "@/config/Config.mjs";

const loggerContext = "Server";

export async function runServer() {
  logger.debug({ context: loggerContext }, "Setting up Server");

  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    path: `${config.server.apiBasePath}/socket.io/`
  });

  // Set up CORS
  if (config.environment.development === "true") {
    app.use(cors());
    logger.warn({ context: loggerContext }, "CORS middleware enabled globally");
  }

  // Set up static frontend page
  app.use(express.static(config.server.staticFolder));

  const { port } = config.server;
  server.listen(port, () => {
    logger.info({ context: loggerContext }, "Server is listening at port %d", port);
  });
}
