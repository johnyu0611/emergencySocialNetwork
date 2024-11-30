import { AbstractController } from "@/controller/Abstract.mjs";
import { logger } from "@/log/Logger.mjs";
import { LocationSharingSessionDataAccess } from "@/model/LocationSharingSession.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/LocationSharingSessionUser.mjs";
import { HTTP_BAD_REQUEST, HTTP_CREATED } from "@/util/Constants.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";

export class LocationSharingSessionUserController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #dao = null;
  #userDao = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== LocationSharingSessionUserController.#initializationSymbol) {
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
    path = "/users"
  ) {
    if (!LocationSharingSessionUserController.#instance) {
      LocationSharingSessionUserController.#instance =
        new LocationSharingSessionUserController({
          upstreamRouter,
          path,
          middlewareMap,
          context,
          symbol: LocationSharingSessionUserController.#initializationSymbol
        });
    }
    return LocationSharingSessionUserController.#instance;
  }

  async handlePost(req, res) {
    const loggerContext = "LocationSharingSessionUserControllerPOSTHandler";
    const { userId } = req.auth;
    const payload = PostRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);
    const { sessionId } = req.params;

    if (!(await this.#dao.isValidSession({ sessionId }))) {
      throw new HTTPError(HTTP_BAD_REQUEST, `Invalid session ID ${sessionId}`);
    }

    const user = {
      userId,
      role: "responder",
      location: payload.location,
      lastSeen: Date.now()
    };

    await this.#dao.addUser({
      sessionId,
      user
    });
    logger.info(
      { context: loggerContext },
      `User ${userId} has become a responder of the sharing session ${sessionId}`
    );

    await this.#userDao.updateLocationSharingSession({
      userId,
      session: { id: sessionId }
    });

    const { locationSharing } = this.context.channel;
    locationSharing.to(sessionId).emit("new_participant", user);

    const responseBody = PostResponseSchema.parse({});
    res.status(HTTP_CREATED);
    res.json(responseBody);
  }

  async handleGet(req, res) {
    const loggerContext = "LocationSharingSessionUserControllerGETHandler";
    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);
    const { sessionId } = req.params;

    const users = await this.#dao.getUsers({ sessionId });

    const responseBody = GetResponseSchema.parse({
      users
    });
    res.json(responseBody);
  }
}
