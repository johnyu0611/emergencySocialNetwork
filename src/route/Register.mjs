import { config } from "@/config/Config.mjs";
import { ChatroomController } from "@/controller/Chatroom.mjs";
import { ChatroomIdController } from "@/controller/ChatroomId.mjs";
import { ChatroomMessageController } from "@/controller/ChatroomMessage.mjs";
import { ChatroomMessageIdController } from "@/controller/ChatroomMessageId.mjs";
import { TokenController } from "@/controller/Token.mjs";
import { UserController } from "@/controller/User.mjs";
import { logger } from "@/log/Logger.mjs";
import { auth } from "@/middleware/Auth.mjs";
import { getWithBody } from "@/middleware/GetWithBody.mjs";
import { json, Router } from "express";

const loggerContext = "RouteRegistrar";

export function registerRoutes(context) {
  const { app, jwt } = context;
  const router = Router({ mergeParams: true });

  const jsonMiddleware = json();
  const getWithBodyMiddleware = getWithBody();
  const authMiddleware = auth(jwt);

  UserController.getInstance(router, context, {
    all: [jsonMiddleware],
    get: [authMiddleware, getWithBodyMiddleware]
  });
  TokenController.getInstance(router, context, {
    all: [jsonMiddleware],
    delete: [authMiddleware]
  });
  ChatroomController.getInstance(router, context, {
    all: [authMiddleware, jsonMiddleware],
    get: [getWithBodyMiddleware]
  });
  ChatroomIdController.getInstance(
    ChatroomController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );
  ChatroomMessageController.getInstance(
    ChatroomIdController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );
  ChatroomMessageIdController.getInstance(
    ChatroomMessageController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );

  app.use(`${config.server.apiBasePath}`, router);
  logger.debug(
    { context: loggerContext },
    `Root router mounted at ${config.server.apiBasePath}`
  );
}
