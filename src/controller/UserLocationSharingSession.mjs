import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PutRequestSchema,
  PutResponseSchema
} from "@/controller/schema/UserLocationSharingSession.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import { HTTP_OK, HTTP_NOT_FOUND, HTTP_FORBIDDEN } from "@/util/Constants.mjs";

export class UserLocationSharingSessionController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #userDao = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== UserLocationSharingSessionController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#userDao = UserDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/:username/location-sharing-session"
  ) {
    if (!UserLocationSharingSessionController.#instance) {
      UserLocationSharingSessionController.#instance =
        new UserLocationSharingSessionController({
          upstreamRouter,
          path,
          middlewareMap,
          context,
          symbol: UserLocationSharingSessionController.#initializationSymbol
        });
    }
    return UserLocationSharingSessionController.#instance;
  }

  async handlePut(req, res) {
    const loggerContext = "UserLocationSharingSessionControllerPUTHandler";
    const { username } = req.auth;
    const payload = PutRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    if (username !== req.params.username) {
      throw new HTTPError(HTTP_FORBIDDEN, "Cannot set other user's session");
    }

    await this.#userDao.updateLocationSharingSession({
      username,
      session: payload
    });

    const responseBody = PutResponseSchema.parse({});
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${username} has updated location sharing session ${payload}`
    );
  }

  async handleGet(req, res) {
    const loggerContext = "UserLocationSharingSessionControllerGETHandler";
    const { username } = req.auth;
    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { locationSharingSession } = await this.#userDao.findByUsername({
      username
    });
    if (!locationSharingSession) {
      throw new HTTPError(HTTP_NOT_FOUND, `Cannot find user ${username}`);
    }

    const responseBody = GetResponseSchema.parse(locationSharingSession);
    res.json(responseBody);
    res.status(HTTP_OK);
  }
}
