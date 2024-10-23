import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema
} from "@/controller/schema/ChatroomMessageId.mjs";
import { logger } from "@/log/Logger.mjs";
import { MessageFactory } from "@/model/MessageFactory.mjs";

export class ChatroomMessageIdController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== ChatroomMessageIdController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
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

    const responseBody = GetResponseSchema.parse(message);
    res.json(responseBody);
  }
}
