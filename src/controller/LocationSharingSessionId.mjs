import { AbstractController } from "@/controller/Abstract.mjs";
import { logger } from "@/log/Logger.mjs";
import { LocationSharingSessionDataAccess } from "@/model/LocationSharingSession.mjs";
import {
  DeleteRequestSchema,
  DeleteResponseSchema
} from "@/controller/schema/LocationSharingSessionId.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { HTTP_BAD_REQUEST, HTTP_FORBIDDEN } from "@/util/Constants.mjs";

export class LocationSharingSessionIdController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #dao = null;
  #userDao = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== LocationSharingSessionIdController.#initializationSymbol) {
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
    path = "/:sessionId"
  ) {
    if (!LocationSharingSessionIdController.#instance) {
      LocationSharingSessionIdController.#instance =
        new LocationSharingSessionIdController({
          upstreamRouter,
          path,
          middlewareMap,
          context,
          symbol: LocationSharingSessionIdController.#initializationSymbol
        });
    }
    return LocationSharingSessionIdController.#instance;
  }

  async handleDelete(req, res) {
    const loggerContext = "LocationSharingSessionIdControllerDELETEHandler";
    const { username } = req.auth;
    const payload = DeleteRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { sessionId } = req.params;

    if (!(await this.#dao.isValidSession({ sessionId }))) {
      throw new HTTPError(HTTP_BAD_REQUEST, `Invalid session ID ${sessionId}`);
    }

    const role = await this.#dao.getRole({ sessionId, username });
    if (role !== "initiator") {
      throw new HTTPError(
        HTTP_FORBIDDEN,
        "Must be the initiator to delete the session"
      );
    }

    const { locationSharing } = this.context.channel;
    locationSharing.to(sessionId).emit("session_deleted", {});

    const users = await this.#dao.getUsers({ sessionId });
    for (const { username } of users) {
      logger.debug(
        { context: loggerContext },
        `Resetting session for ${username}`
      );
      await this.#userDao.updateLocationSharingSession({
        username,
        session: { id: "undefined" }
      });
    }

    await this.#dao.delete({ sessionId });
    logger.info(
      { context: loggerContext },
      `User ${username} has deleted session ${sessionId}`
    );

    const responseBody = DeleteResponseSchema.parse({});
    res.json(responseBody);
  }
}
