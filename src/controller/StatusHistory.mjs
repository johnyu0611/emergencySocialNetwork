import { StatusHistoryDataAccess } from "@/model/StatusHistory.mjs";
import { PrivateChatroomsDataAccess } from "@/model/PrivateChatrooms.mjs";
import { AbstractController } from "@/controller/Abstract.mjs";
import {
  StatusHistoryGetRequestSchema,
  StatusHistoryGetResponseSchema
} from "@/controller/schema/StatusHistory.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { HTTP_OK, HTTP_NOT_FOUND } from "@/util/Constants.mjs";
import { UserDataAccess } from "@/model/User.mjs";

export class StatusHistoryController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #statusHistoryDAO = null;
  #privateChatroomsDAO = null;
  #userDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== StatusHistoryController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#statusHistoryDAO = StatusHistoryDataAccess.getInstance();
    this.#privateChatroomsDAO = PrivateChatroomsDataAccess.getInstance();
    this.#userDAO = UserDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/status-history"
  ) {
    if (!StatusHistoryController.#instance) {
      StatusHistoryController.#instance = new StatusHistoryController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: StatusHistoryController.#initializationSymbol
      });
    }
    return StatusHistoryController.#instance;
  }

  async handleGet(req, res) {
    const loggerContext = "StatusHistoryControllerGETHandler";
    const { userId } = req.auth;
    const currUsername = userId;
    const payload = StatusHistoryGetRequestSchema.parse(req.body);
    const { roomId } = payload;
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const chatroom = await this.#privateChatroomsDAO.findByRoomID({ roomId });
    if (!chatroom || !chatroom.participants) {
      throw new HTTPError(
        HTTP_NOT_FOUND,
        "Chat room or participants not found"
      );
    }

    const updatedParticipants = chatroom.participants.filter(
      (username) => username !== currUsername
    );

    const historyPromises = updatedParticipants.map(async (userId) => {
      const userHistory =
        await this.#statusHistoryDAO.getStatusHistoryByUserId(userId);
      const user = await this.#userDAO.findById({ userId });
      return userHistory.map((entry) => ({
        sender: user.username,
        status: entry.status,
        timestamp: entry.timestamp
      }));
    });

    const statusHistory = (await Promise.all(historyPromises)).flat();

    const responseBody = StatusHistoryGetResponseSchema.parse(statusHistory);
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `Retrieved status history for participants in room ${roomId}`
    );
  }
}
