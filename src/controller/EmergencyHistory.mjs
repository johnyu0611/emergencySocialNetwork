import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PostRequestSchema,
  PostResponseSchema,
  DeleteRequestSchema
} from "@/controller/schema/EmergencyHistory.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_BAD_REQUEST
} from "@/util/Constants.mjs";

export class EmergencyHistoryController extends AbstractController {
  static #initializationSymbol = Symbol("$$");
  static #instance = null;
  #userDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== EmergencyHistoryController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#userDAO = UserDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/emergency-history"
  ) {
    if (!EmergencyHistoryController.#instance) {
      EmergencyHistoryController.#instance = new EmergencyHistoryController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: EmergencyHistoryController.#initializationSymbol
      });
    }
    return EmergencyHistoryController.#instance;
  }

  setUserDAO(userDAO) {
    this.#userDAO = userDAO;
  }

  async handlePost(req, res) {
    const loggerContext = "EmergencyHistoryControllerPOSTHandler";
    const { userId } = req.auth;
    const payload = PostRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { content } = payload;
    const user = await this.#userDAO.findById({ userId });
    console.log(user);

    console.log(`${user.username} send ${content}`);

    if (!user) {
      throw new HTTPError(HTTP_NOT_FOUND, "User not found");
    }

    const recipient = await this.#userDAO.findById({
      userId: user.emergencyContactTo
    });
    if (!recipient) {
      throw new HTTPError(HTTP_NOT_FOUND, "Recipient user not found");
    }

    const isDuplicate = recipient.emergencyHistory.some(
      (msg) => msg.sender === user.userId && msg.content === content
    );

    if (isDuplicate) {
      throw new HTTPError(HTTP_BAD_REQUEST, "Duplicate message detected");
    }

    await this.#userDAO.updateById(
      { userId: user.emergencyContactTo },
      {
        $push: {
          emergencyHistory: {
            sender: user.userId,
            content,
            timestamp: new Date().setMilliseconds(0)
          }
        }
      }
    );

    this.context.channel.system.emit("new_emergency_history");

    const responseBody = PostResponseSchema.parse({
      sender: user.username,
      // timestamp: new Date().setMilliseconds(0),
      content: content
    });
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${userId} has logged emergency info for ${user.emergencyContactTo}`
    );
  }

  async handleGet(req, res) {
    const loggerContext = "EmergencyHistoryControllerGETHandler";
    const { userId } = req.auth;
    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);
    const { who } = payload;

    let user = await this.#userDAO.findById({ userId });
    let history = [];

    if (who === "other") {
      user = await this.#userDAO.findById({
        userId: user.emergencyContactTo
      });
    }

    if (user && user.emergencyHistory) {
      user.emergencyHistory.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      history = await Promise.all(
        user.emergencyHistory.map(async ({ sender, timestamp, content }) => {
          let senderUsername = undefined;

          if (sender) {
            const senderUser = await this.#userDAO.findById({ userId: sender });
            senderUsername = senderUser ? senderUser.username : undefined;
          }

          return {
            sender: senderUsername,
            timestamp: timestamp || undefined,
            content: content || undefined
          };
        })
      );
    }

    const responseBody = GetResponseSchema.parse({ history });
    console.log(responseBody);
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${userId} has retrieved emergency info`
    );
  }

  async handleDelete(req, res) {
    const loggerContext = "EmergencyHistoryControllerGETHandler";
    const { userId } = req.auth;
    try {
      const payload = DeleteRequestSchema.parse(req.body);
      logger.debug({ context: loggerContext }, "Request received: %o", payload);

      // const timestampDate = new Date(payload.timestamp).toISOString();
      const senderId = await this.#userDAO.findByUsername({
        username: payload.sender
      });

      const result = await this.#userDAO.updateById(
        { userId },
        {
          $pull: {
            emergencyHistory: {
              sender: senderId.userId,
              content: payload.content
            }
          }
        }
      );

      if (!result) {
        throw new Error("Delete operation failed");
      }
      this.context.channel.system.emit("new_emergency_history");

      logger.info({ context: loggerContext }, "Delete operation succeeded");
      res
        .status(200)
        .json({ message: "Emergency history deleted successfully" });
    } catch (error) {
      logger.error(
        { context: loggerContext, error },
        "Error handling delete request"
      );
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
