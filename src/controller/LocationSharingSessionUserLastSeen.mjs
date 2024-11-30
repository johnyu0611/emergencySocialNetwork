import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PutRequestSchema,
  PutResponseSchema
} from "@/controller/schema/LocationSharingSessionUserLastSeen.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import {
  HTTP_OK,
  HTTP_FORBIDDEN,
  HTTP_BAD_REQUEST
} from "@/util/Constants.mjs";
import { LocationSharingSessionDataAccess } from "@/model/LocationSharingSession.mjs";
import { UserDataAccess } from "@/model/User.mjs";

export class LocationSharingSessionUserLastSeenController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #dao = null;
  #userDao = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (
      symbol !==
      LocationSharingSessionUserLastSeenController.#initializationSymbol
    ) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#dao = LocationSharingSessionDataAccess.getInstance();
    this.#userDao = UserDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/:userId/last-seen"
  ) {
    if (!LocationSharingSessionUserLastSeenController.#instance) {
      LocationSharingSessionUserLastSeenController.#instance =
        new LocationSharingSessionUserLastSeenController({
          upstreamRouter,
          path,
          middlewareMap,
          context,
          symbol:
            LocationSharingSessionUserLastSeenController.#initializationSymbol
        });
    }
    return LocationSharingSessionUserLastSeenController.#instance;
  }

  async handlePut(req, res) {
    const loggerContext =
      "LocationSharingSessionUserLastSeenControllerPUTHandler";
    const { userId } = req.auth;
    const payload = PutRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    if (userId !== parseInt(req.params.userId)) {
      throw new HTTPError(HTTP_FORBIDDEN, "Cannot set other user's property");
    }

    const { sessionId } = req.params;

    if (!(await this.#dao.isValidSession({ sessionId }))) {
      throw new HTTPError(HTTP_BAD_REQUEST, `Invalid session ID ${sessionId}`);
    }

    const { lastSeen } = payload;
    await this.#dao.setLastSeen({ sessionId, userId, lastSeen });

    const { locationSharing } = this.context.channel;
    locationSharing.to(sessionId).emit("update", {
      userId,
      lastSeen
    });

    const responseBody = PutResponseSchema.parse({});
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${userId} has updated their last seen timestamp to ${lastSeen}`
    );
  }

  async handleGet(req, res) {
    const loggerContext =
      "LocationSharingSessionUserLastSeenControllerGETHandler";
    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { sessionId, userId } = req.params;

    if (!(await this.#dao.isValidSession({ sessionId }))) {
      throw new HTTPError(HTTP_BAD_REQUEST, `Invalid session ID ${sessionId}`);
    }

    if (!(await this.#userDao.isValidUserId({ userId }))) {
      throw new HTTPError(HTTP_BAD_REQUEST, `Invalid userId ${userId}`);
    }

    const lastSeen = await this.#dao.getLastSeen({ sessionId, userId });

    const responseBody = GetResponseSchema.parse({
      lastSeen
    });
    res.json(responseBody);
    res.status(HTTP_OK);
  }
}
