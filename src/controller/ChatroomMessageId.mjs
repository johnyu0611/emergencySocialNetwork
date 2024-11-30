import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema
} from "@/controller/schema/ChatroomMessageId.mjs";
import { logger } from "@/log/Logger.mjs";
import { MessageFactory } from "@/model/MessageFactory.mjs";
import { UserDataAccess } from "@/model/User.mjs";

export class ChatroomMessageIdController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #userDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== ChatroomMessageIdController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#userDAO = UserDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/:messageId"
  ) {
    if (!ChatroomMessageIdController.#instance) {
      ChatroomMessageIdController.#instance = new ChatroomMessageIdController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: ChatroomMessageIdController.#initializationSymbol
      });
    }
    return ChatroomMessageIdController.#instance;
  }

  async handleGet(req, res) {
    const loggerContext = "ChatroomMessageIDControllerGETHandler";
    const { chatroomId, messageId } = req.params;
    logger.debug(
      { context: loggerContext },
      "Parameter received: %o",
      req.params
    );

    const model = MessageFactory.getModel(chatroomId);

    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const message = await model.findOne({ id: messageId });
    const user = await this.#userDAO.findById({ userId: message.sender });
    const response = {
      id: message.id,
      content: message.content,
      timestamp: message.timestamp,
      sender: user ? user.username : "undefined"
    };
    const responseBody = GetResponseSchema.parse(response);
    res.json(responseBody);
  }
}
