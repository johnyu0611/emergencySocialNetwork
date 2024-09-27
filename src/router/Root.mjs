import { config } from "@/config/Config.mjs";
import { TokenController } from "@/controller/TokenController.mjs";
import { UserController } from "@/controller/UserController.mjs";
import { logger } from "@/log/Logger.mjs";
import express, { json } from "express";

const loggerContext = "RootRouterRegistrar";

export function registerRootRouter(context) {
  const { app } = context;
  const router = express.Router();
  router.use(json());

  UserController.getInstance({ upstreamRouter: router, context });
  TokenController.getInstance({ upstreamRouter: router, context });

  app.use(`${config.server.apiBasePath}/`, router);
  logger.debug(
    { context: loggerContext },
    `Root router mounted at ${config.server.apiBasePath}/`
  );
}
