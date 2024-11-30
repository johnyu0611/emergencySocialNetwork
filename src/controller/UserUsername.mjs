import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema
} from "@/controller/schema/UserUsername.mjs";
import { logger } from "@/log/Logger.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import { HTTP_OK } from "@/util/Constants.mjs";

export class UserUsernameController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #userDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== UserUsernameController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#userDAO = UserDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/:userId/username"
  ) {
    if (!UserUsernameController.#instance) {
      UserUsernameController.#instance = new UserUsernameController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: UserUsernameController.#initializationSymbol
      });
    }
    return UserUsernameController.#instance;
  }

  setUserDAO(userDAO) {
    this.#userDAO = userDAO;
  }

  async handleGet(req, res) {
    const loggerContext = "UserUsernameControllerGETHandler";

    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { userId } = req.params;
    const { username } = await this.#userDAO.findById({ userId });

    const responseBody = GetResponseSchema.parse({
      username
    });
    res.json(responseBody);
    res.status(HTTP_OK);
  }
}
