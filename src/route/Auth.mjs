import { handleUsername } from "@/api/Username.mjs";
import { handleUsers } from "@/api/Users.mjs";
import { config } from "@/config/Config.mjs";
import { logger } from "@/log/Logger.mjs";
import express, { json } from "express";

const loggerContext = "AuthRouteRegistrar";

export function registerAuthRoute(context) {
  const { app } = context;
  const router = express.Router();
  router.use(json());

  handleUsers({ ...context, router });
  handleUsername({ ...context, router });

  app.use(`${config.server.apiBasePath}/auth`, router);
  logger.debug(
    { context: loggerContext },
    `Auth router mounted at ${config.server.apiBasePath}/auth`
  );
}
