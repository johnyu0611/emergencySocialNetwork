import { AbstractController } from "@/controller/Abstract.mjs";
import { logger } from "@/log/Logger.mjs";
import { HTTP_CREATED } from "@/util/Constants.mjs";
import { LocationSharingSessionDataAccess } from "@/model/LocationSharingSession.mjs";
import {
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/LocationSharingSession.mjs";
import { v4 as uuid } from "uuid";
import { UserDataAccess } from "@/model/User.mjs";

export class LocationSharingSessionController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #dao = null;
  #userDao = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== LocationSharingSessionController.#initializationSymbol) {
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
    path = "/location-sharing/sessions"
  ) {
    if (!LocationSharingSessionController.#instance) {
      LocationSharingSessionController.#instance =
        new LocationSharingSessionController({
          upstreamRouter,
          path,
          middlewareMap,
          context,
          symbol: LocationSharingSessionController.#initializationSymbol
        });
    }
    return LocationSharingSessionController.#instance;
  }

  async handlePost(req, res) {
    const loggerContext = "LocationSharingSessionControllerPOSTHandler";
    const { username } = req.auth;
    const payload = PostRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const sessionId = uuid();
    await this.#dao.create({ sessionId });
    logger.info(
      { context: loggerContext },
      `User ${username} has created location sharing session ${sessionId}`
    );

    await this.#dao.addUser({
      sessionId,
      user: {
        username,
        role: "initiator",
        location: payload.location,
        lastSeen: Date.now()
      }
    });
    logger.info(
      { context: loggerContext },
      `User ${username} has become the initiator of the sharing session ${sessionId}`
    );

    await this.#userDao.updateLocationSharingSession({
      username,
      session: { id: sessionId }
    });

    const { system } = this.context.channel;
    system.emit("new_location_sharing_session", {
      username,
      sessionId
    });

    const responseBody = PostResponseSchema.parse({
      id: sessionId
    });
    res.status(HTTP_CREATED);
    res.json(responseBody);
  }
}
