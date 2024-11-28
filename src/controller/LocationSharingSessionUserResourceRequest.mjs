import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PutRequestSchema,
  PutResponseSchema
} from "@/controller/schema/LocationSharingSessionUserResourceRequest.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import {
  HTTP_OK,
  HTTP_FORBIDDEN,
  HTTP_BAD_REQUEST
} from "@/util/Constants.mjs";
import { LocationSharingSessionDataAccess } from "@/model/LocationSharingSession.mjs";
import { UserDataAccess } from "@/model/User.mjs";

export class LocationSharingSessionUserResourceRequestController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #dao = null;
  #userDao = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (
      symbol !==
      LocationSharingSessionUserResourceRequestController.#initializationSymbol
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
    path = "/:username/resource-request"
  ) {
    if (!LocationSharingSessionUserResourceRequestController.#instance) {
      LocationSharingSessionUserResourceRequestController.#instance =
        new LocationSharingSessionUserResourceRequestController({
          upstreamRouter,
          path,
          middlewareMap,
          context,
          symbol:
            LocationSharingSessionUserResourceRequestController
              .#initializationSymbol
        });
    }
    return LocationSharingSessionUserResourceRequestController.#instance;
  }

  async handlePut(req, res) {
    const loggerContext =
      "LocationSharingSessionUserResourceRequestControllerPUTHandler";
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

    const role = await this.#dao.getRole({ sessionId, username });
    if (role !== "initiator") {
      throw new HTTPError(
        HTTP_BAD_REQUEST,
        "Must be the initiator to set resource request"
      );
    }

    const { resourceRequest } = payload;
    await this.#dao.setResourceRequest({
      sessionId,
      username,
      resourceRequest
    });

    const { locationSharing } = this.context.channel;
    locationSharing.to(sessionId).emit("update", {
      username,
      resourceRequest
    });

    const responseBody = PutResponseSchema.parse({});
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${username} has updated their resource request to ${resourceRequest}`
    );
  }

  async handleGet(req, res) {
    const loggerContext =
      "LocationSharingSessionUserResourceRequestControllerGETHandler";
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
    if (role !== "initiator") {
      throw new HTTPError(
        HTTP_BAD_REQUEST,
        `Attempted to get resource request from a ${role}`
      );
    }

    const resourceRequest = await this.#dao.getResourceRequest({
      sessionId,
      username
    });

    const responseBody = GetResponseSchema.parse({
      resourceRequest
    });
    res.json(responseBody);
    res.status(HTTP_OK);
  }
}
