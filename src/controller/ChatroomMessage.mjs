import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/ChatroomMessage.mjs";
import { MessageFactory } from "@/model/MessageFactory.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import { logger } from "@/log/Logger.mjs";

import { v7 as uuid } from "uuid";
import {
  CHANNEL_CHATROOM_EVENT_MESSAGE,
  CHANNEL_SYSTEM_EVENT_NEW_ANNOUNCEMENT,
  HTTP_CREATED
} from "@/util/Constants.mjs";
import { ANNOUCEMENT_SPACE_ID } from "../util/Constants.mjs";

export class ChatroomMessageController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #userDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== ChatroomMessageController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#userDAO = UserDataAccess.getInstance();
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
    const { username } = req.auth;
    const { chatroomId } = req.params;
    const messageModel = MessageFactory.getModel(chatroomId);

    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const searchByContent = payload.searchBy?.content ?? ".*";

    const messages = await messageModel.find({
      $and: [{ content: { $regex: searchByContent, $options: "i" } }]
    });

    for (const message of messages) {
      if (message.sender !== username && !message.readBy.includes(username)) {
        await messageModel.update(
          // eslint-disable-next-line no-underscore-dangle
          { _id: message._id },
          { $push: { readBy: username } }
        );
      }
    }

    const responseBody = GetResponseSchema.parse({
      messages
    });
    res.json(responseBody);
  }

  async handlePost(req, res) {
    const loggerContext = "ChatroomMessageControllerPOSTHandler";
    const { username } = req.auth;
    const { chatroomId } = req.params;
    const messageModel = MessageFactory.getModel(chatroomId);

    const payload = PostRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { content } = payload;
    const { receiver } = payload;
    const user = await this.#userDAO.findByUsername({ username });
    let status = user?.status;
    if (!status) {
      status = "Undefined";
    }

    const messageId = uuid();

    const message = {
      id: messageId,
      chatroomId,
      sender: username,
      receiver: receiver,
      status: status,
      timestamp: Date.now(),
      content: content
    };
    await messageModel.create(message);

    this.context.channel.chatroom.emit(CHANNEL_CHATROOM_EVENT_MESSAGE, message);
    this.context.channel.system.emit(CHANNEL_CHATROOM_EVENT_MESSAGE, message);
    if (chatroomId === ANNOUCEMENT_SPACE_ID) {
      this.context.channel.system.emit(
        CHANNEL_SYSTEM_EVENT_NEW_ANNOUNCEMENT,
        message
      );
    }

    const responseBody = PostResponseSchema.parse({
      id: messageId
    });
    res.status(HTTP_CREATED);
    res.json(responseBody);
    logger.info(
      { context: loggerContext },
      `User ${username} has posted a message in chatroom ${chatroomId}`
    );
  }
}
