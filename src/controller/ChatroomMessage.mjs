import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/ChatroomMessage.mjs";
import { logger } from "@/log/Logger.mjs";
import { MessageDataAccess } from "@/model/Message.mjs";
import { HTTP_CREATED } from "@/util/Constants.mjs";

export class ChatroomMessageController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #messageDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== ChatroomMessageController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#messageDAO = MessageDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/messages"
  ) {
    if (!ChatroomMessageController.#instance) {
      ChatroomMessageController.#instance = new ChatroomMessageController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: ChatroomMessageController.#initializationSymbol
      });
    }
    return ChatroomMessageController.#instance;
  }

  async handleGet(req, res) {
    const loggerContext = "ChatroomMessageControllerGETHandler";
    // const { username } = req.auth;
    // const { chatroomId } = req.params;

    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const messages = await this.#messageDAO.findAll();

    const responseBody = GetResponseSchema.parse({
      messages
    });
    res.json(responseBody);
  }

  async handlePost(req, res) {
    const loggerContext = "ChatroomMessageControllerPOSTHandler";
    const { username } = req.auth;
    const { chatroomId } = req.params;

    const payload = PostRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { content } = payload;

    const message = {
      author: username,
      content,
      timestamp: Date.now()
    };
    await this.#messageDAO.create(message);

    const { chatroomChannel } = this.context;
    chatroomChannel.emit("message", message);

    const responseBody = PostResponseSchema.parse({});
    res.status(HTTP_CREATED);
    res.json(responseBody);
    logger.info(
      { context: loggerContext },
      `User ${username} has posted a message in chatroom ${chatroomId}`
    );
  }
}
