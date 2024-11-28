import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PutRequestSchema,
  PutResponseSchema
} from "@/controller/schema/LocationSharingSessionUserRole.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import {
  HTTP_OK,
  HTTP_FORBIDDEN,
  HTTP_BAD_REQUEST
} from "@/util/Constants.mjs";
import { LocationSharingSessionDataAccess } from "@/model/LocationSharingSession.mjs";
import { UserDataAccess } from "@/model/User.mjs";

export class LocationSharingSessionUserRoleController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #dao = null;
  #userDao = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (
      symbol !== LocationSharingSessionUserRoleController.#initializationSymbol
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
    path = "/:username/role"
  ) {
    if (!LocationSharingSessionUserRoleController.#instance) {
      LocationSharingSessionUserRoleController.#instance =
        new LocationSharingSessionUserRoleController({
          upstreamRouter,
          path,
          middlewareMap,
          context,
          symbol: LocationSharingSessionUserRoleController.#initializationSymbol
        });
    }
    return LocationSharingSessionUserRoleController.#instance;
  }

  async handlePut(req, res) {
    const loggerContext = "LocationSharingSessionUserRoleControllerPUTHandler";
    const { username } = req.auth;
    const payload = PutRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    if (username !== req.params.username) {
      throw new HTTPError(HTTP_FORBIDDEN, "Cannot set other user's property");
    }

    const { sessionId } = req.params;

    if (!(await this.#dao.isValidSession({ sessionId }))) {
      throw new HTTPError(HTTP_BAD_REQUEST, `Invalid session ID ${sessionId}`);
    }

    const { role } = payload;
    await this.#dao.setRole({ sessionId, username, role });

    const responseBody = PutResponseSchema.parse({});
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${username} has updated their role to ${role}`
    );
  }

  async handleGet(req, res) {
    const loggerContext = "LocationSharingSessionUserRoleControllerGETHandler";
    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { sessionId, username } = req.params;

    if (!(await this.#dao.isValidSession({ sessionId }))) {
      throw new HTTPError(HTTP_BAD_REQUEST, `Invalid session ID ${sessionId}`);
    }

    if (!(await this.#userDao.isValidUsername({ username }))) {
      throw new HTTPError(HTTP_BAD_REQUEST, `Invalid username ${username}`);
    }

    const role = await this.#dao.getRole({ sessionId, username });

    const responseBody = GetResponseSchema.parse({
      role
    });
    res.json(responseBody);
    res.status(HTTP_OK);
  }
}
