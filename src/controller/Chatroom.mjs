import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/Chatroom.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import { MessageFactory } from "@/model/MessageFactory.mjs";
import { v4 as uuid } from "uuid";
import { logger } from "@/log/Logger.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { HTTP_NOT_FOUND, HTTP_CREATED, HTTP_OK } from "@/util/Constants.mjs";

export class ChatroomController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #userDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== ChatroomController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#userDAO = UserDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/chatrooms"
  ) {
    if (!ChatroomController.#instance) {
      ChatroomController.#instance = new ChatroomController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: ChatroomController.#initializationSymbol
      });
    }
    return ChatroomController.#instance;
  }

  setUserDAO(userDAO) {
    this.#userDAO = userDAO;
  }

  async handleGet(req, res) {
    const loggerContext = "ChatroomControllerGETHandler";
    const { username } = req.auth;
    // console.log(username);
    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const user = await this.#userDAO.findByUsername({ username });
    if (!user) {
      throw new HTTPError(HTTP_NOT_FOUND, "User not found");
    }

    const chatroomIds = user.chatrooms.map((chatroom) => chatroom.id);
    const chatroom = await Promise.all(
      chatroomIds.map(async (chatroomId) => {
        if (chatroomId === "00000000-0000-0000-0000-000000000000") {
          return {
            id: "00000000-0000-0000-0000-000000000000",
            title: "Public Chatroom"
          };
        }

        const messageModel = MessageFactory.getModel(chatroomId);
        const messages = await messageModel.findAll();
        // console.log(messages);
        const hasUnread = messages.some(
          (message) =>
            !message.readBy.includes(user.username) &&
            message.sender !== username
        );
        // console.log(`hasUread ${hasUnread}`);
        const chatroomData = user.chatrooms.find(
          (chatroom) => chatroom.id === chatroomId
        );
        const { receiver } = chatroomData;
        const { status } = await this.#userDAO.findByUsername({
          username: receiver
        });
        const title = messages.length > 0 ? messages[0].title : chatroomId;

        return {
          id: chatroomId,
          title: title,
          receiver: receiver,
          status: status,
          hasUnread: hasUnread
        };
      })
    );

    const allUsers = await this.#userDAO.findAll();
    const receiversInChatrooms = new Set(
      chatroom.map((c) => c.receiver).filter(Boolean)
    );
    const usersNotInReceivers = allUsers.filter(
      (user) => !receiversInChatrooms.has(user.username)
    );

    if (usersNotInReceivers.length > 0) {
      usersNotInReceivers.forEach((user) => {
        if (user.username !== username) {
          chatroom.push({
            receiver: user.username,
            status: user.status
          });
        }
      });
    }

    // console.log(chatroom);
    const responseBody = GetResponseSchema.parse({
      chatrooms: chatroom
    });
    res.status(HTTP_OK);
    res.json(responseBody);
  }

  async handlePost(req, res) {
    const loggerContext = "ChatroomControllerPOSTHandler";
    const { username } = req.auth;
    const payload = PostRequestSchema.parse(req.body);
    const { receiver } = payload;

    logger.debug(
      { context: loggerContext },
      `Created a new private room for ${username} and ${receiver}`
    );

    const chatroomId = uuid();

    await this.#userDAO.update(
      { username },
      { $push: { chatrooms: { id: chatroomId, receiver: receiver } } }
    );

    await this.#userDAO.update(
      { username: receiver },
      { $push: { chatrooms: { id: chatroomId, receiver: username } } }
    );

    const { chatroom } = this.context.channel;
    chatroom.emit("newRoom", { chatroomId });

    const responseBody = PostResponseSchema.parse({
      id: chatroomId,
      receiver: receiver
    });

    res.status(HTTP_CREATED);
    res.json(responseBody);
  }
}
