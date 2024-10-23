import { AbstractController } from "@/controller/Abstract.mjs";
import {
  StatusRequestSchema,
  StatusResponseSchema,
  StatusGetRequestSchema,
  StatusGetResponseSchema
} from "@/controller/schema/Status.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_BAD_REQUEST
} from "@/util/Constants.mjs";

export class StatusController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #userDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== StatusController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#userDAO = UserDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/status"
  ) {
    if (!StatusController.#instance) {
      StatusController.#instance = new StatusController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: StatusController.#initializationSymbol
      });
    }
    return StatusController.#instance;
  }

  async handlePost(req, res) {
    const loggerContext = "StatusControllerPOSTHandler";
    const { username } = req.auth;
    const payload = StatusRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { status } = payload;

    if (!["OK", "Help", "Emergency"].includes(status)) {
      throw new HTTPError(HTTP_BAD_REQUEST, "Invalid status value");
    }

    const user = await this.#userDAO.findByUsername({ username });
    if (!user) {
      throw new HTTPError(HTTP_NOT_FOUND, "User not found");
    }

    await this.#userDAO.update({ username }, { status });

    const { system } = this.context.channel;
    system.emit("status_change");

    const responseBody = StatusResponseSchema.parse({
      status: status
    });
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${username} has updated status to ${status}`
    );
  }

  async handleGet(req, res) {
    const loggerContext = "StatusControllerGETHandler";

    const payload = StatusGetRequestSchema.parse(req.body);
    const { username } = payload;
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const user = await this.#userDAO.findByUsername({ username });
    // console.log(user);
    const responseBody = StatusGetResponseSchema.parse({
      status: user.status
    });
    res.json(responseBody);
    res.status(HTTP_OK);
  }
}
