import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PutRequestSchema,
  PutResponseSchema
} from "@/controller/schema/LocationSharingSessionUserResourceResponse.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import {
  HTTP_OK,
  HTTP_FORBIDDEN,
  HTTP_BAD_REQUEST
} from "@/util/Constants.mjs";
import { LocationSharingSessionDataAccess } from "@/model/LocationSharingSession.mjs";
import { UserDataAccess } from "@/model/User.mjs";

export class LocationSharingSessionUserResourceResponseController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #dao = null;
  #userDao = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (
      symbol !==
      LocationSharingSessionUserResourceResponseController.#initializationSymbol
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
    path = "/:userId/resource-response"
  ) {
    if (!LocationSharingSessionUserResourceResponseController.#instance) {
      LocationSharingSessionUserResourceResponseController.#instance =
        new LocationSharingSessionUserResourceResponseController({
          upstreamRouter,
          path,
          middlewareMap,
          context,
          symbol:
            LocationSharingSessionUserResourceResponseController
              .#initializationSymbol
        });
    }
    return LocationSharingSessionUserResourceResponseController.#instance;
  }

  async handlePut(req, res) {
    const loggerContext =
      "LocationSharingSessionUserResourceResponseControllerPUTHandler";
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

    const role = await this.#dao.getRole({ sessionId, userId });
    if (role !== "responder") {
      throw new HTTPError(
        HTTP_BAD_REQUEST,
        "Must be a responder to set resource response"
      );
    }

    const { resourceResponse } = payload;
    await this.#dao.setResourceResponse({
      sessionId,
      userId,
      resourceResponse
    });

    const { locationSharing } = this.context.channel;
    locationSharing.to(sessionId).emit("update", {
      userId,
      resourceResponse
    });

    const responseBody = PutResponseSchema.parse({});
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${userId} has updated their resource response to ${resourceResponse}`
    );
  }

  async handleGet(req, res) {
    const loggerContext =
      "LocationSharingSessionUserResourceResponseControllerGETHandler";
    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { sessionId, userId } = req.params;

    if (!(await this.#dao.isValidSession({ sessionId }))) {
      throw new HTTPError(HTTP_BAD_REQUEST, `Invalid session ID ${sessionId}`);
    }

    if (!(await this.#userDao.isValidUserId({ userId }))) {
      throw new HTTPError(HTTP_BAD_REQUEST, `Invalid userId ${userId}`);
    }

    const role = await this.#dao.getRole({ sessionId, userId });
    if (role !== "responder") {
      throw new HTTPError(
        HTTP_BAD_REQUEST,
        `Attempted to get resource response from a ${role}`
      );
    }

    const resourceResponse = await this.#dao.getResourceResponse({
      sessionId,
      userId
    });

    const responseBody = GetResponseSchema.parse({
      resourceResponse
    });
    res.json(responseBody);
    res.status(HTTP_OK);
  }
}
