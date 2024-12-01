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
import { ANNOUCEMENT_SPACE_ID } from "../util/Constants.mjs";
import { PrivateChatroomsDataAccess } from "@/model/PrivateChatrooms.mjs";

export class ChatroomController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #userDAO = null;
  #privateChatroomsDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== ChatroomController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#userDAO = UserDataAccess.getInstance();
    this.#privateChatroomsDAO = PrivateChatroomsDataAccess.getInstance();
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
    const { userId } = req.auth;
    // console.log(username);
    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const user = await this.#userDAO.findById({ userId });
    if (!user) {
      throw new HTTPError(HTTP_NOT_FOUND, "User not found");
    }
    // const { username } = user;
    //console.log(username);
    const chatroomIds = user.chatrooms.map((chatroom) => chatroom.id);
    let chatroom = await Promise.all(
      chatroomIds.map(async (chatroomId) => {
        if (chatroomId === "00000000-0000-0000-0000-000000000000") {
          return {
            id: "00000000-0000-0000-0000-000000000000",
            title: "Public Chatroom"
          };
        }

        if (chatroomId === ANNOUCEMENT_SPACE_ID) {
          return {
            id: "11111111-1111-1111-1111-111111111111",
            title: "Announcement"
          };
        }
        //console.log(chatroomId);
        const messageModel = MessageFactory.getModel(chatroomId);
        const messages = await messageModel.findAll();
        // console.log(messages);
        const hasUnread = messages.some(
          (message) =>
            !message.readBy.includes(userId) && message.sender !== userId
        );
        // console.log(`hasUread ${hasUnread}`);
        const chatroomData = user.chatrooms.find(
          (chatroom) => chatroom.id === chatroomId
        );
        const { receiver } = chatroomData;
        const receiverUser = await this.#userDAO.findById({
          userId: receiver
        });

        // if (receiverUser.isActive === false) {
        //   return null;
        // }
        //console.log(receiverUser);
        const title = messages.length > 0 ? messages[0].title : chatroomId;

        return {
          id: chatroomId,
          title: title,
          receiver: receiverUser ? receiverUser.username : "undefined",
          status: receiverUser ? receiverUser.status : "undefined",
          hasUnread: hasUnread
        };
      })
    );

    chatroom = chatroom.filter((room) => room !== null);

    const allUsers = await this.#userDAO.findAll();
    //console.log(allUsers);
    const receiversInChatrooms = new Set(
      chatroom.map((c) => c.receiver).filter(Boolean)
    );
    const usersNotInReceivers = allUsers.filter(
      (user) => !receiversInChatrooms.has(user.username)
    );

    if (usersNotInReceivers.length > 0) {
      usersNotInReceivers.forEach((user) => {
        //console.log(user);
        //console.log(userId);
        // console.log(user.isActi);
        if (user.userId !== userId && user.isActive !== false) {
          chatroom.push({
            receiver: user.username,
            status: user.status
          });
        }
      });
    }

    //console.log(chatroom);
    const responseBody = GetResponseSchema.parse({
      chatrooms: chatroom
    });
    res.status(HTTP_OK);
    res.json(responseBody);
  }

  async handlePost(req, res) {
    const loggerContext = "ChatroomControllerPOSTHandler";
    const { userId } = req.auth;
    const payload = PostRequestSchema.parse(req.body);
    const { receiver } = payload;

    const user = await this.#userDAO.findById({ userId });
    const { username } = user;

    logger.debug(
      { context: loggerContext },
      `Created a new private room for ${username} and ${receiver}`
    );

    const temp = await this.#userDAO.findByUsername({ username: receiver });
    const receiverId = temp.userId;

    const existChatroom = await this.#privateChatroomsDAO.findByUser({
      userId,
      receiverId
    });

    console.log(existChatroom);

    if (existChatroom) {
      const response = PostResponseSchema.parse({
        id: existChatroom.roomId,
        receiver: receiver
      });

      res.status(HTTP_CREATED);
      res.json(response);
    } else {
      let chatroomId = uuid();

      while (
        chatroomId === ANNOUCEMENT_SPACE_ID ||
        chatroomId === "00000000-0000-0000-0000-000000000000"
      ) {
        chatroomId = uuid();
      }

      await this.#userDAO.updateById(
        { userId },
        { $push: { chatrooms: { id: chatroomId, receiver: receiverId } } }
      );

      await this.#userDAO.update(
        { username: receiver },
        { $push: { chatrooms: { id: chatroomId, receiver: userId } } }
      );

      const { chatroom } = this.context.channel;
      chatroom.emit("newRoom", { chatroomId });
      this.#privateChatroomsDAO.create({
        roomId: chatroomId,
        participants: [userId, receiverId]
      });

      const responseBody = PostResponseSchema.parse({
        id: chatroomId,
        receiver: receiver
      });
      this.context.channel.system.emit("status_change");
      res.status(HTTP_CREATED);
      res.json(responseBody);
    }
  }
}
