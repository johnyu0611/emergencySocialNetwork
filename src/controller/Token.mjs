import { AbstractController } from "@/controller/Abstract.mjs";
import {
  DeleteRequestSchema,
  DeleteResponseSchema,
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/Token.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import {
  HTTP_CREATED,
  HTTP_FORBIDDEN,
  HTTP_NOT_FOUND
} from "@/util/Constants.mjs";

export class TokenController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #userDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== TokenController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#userDAO = UserDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/tokens"
  ) {
    if (!TokenController.#instance) {
      TokenController.#instance = new TokenController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: TokenController.#initializationSymbol
      });
    }
    return TokenController.#instance;
  }

  setUserDAO(userDAO) {
    this.#userDAO = userDAO;
  }

  async handlePost(req, res) {
    const loggerContext = "TokenControllerPOSTHandler";
    const { jwt, passwordHasher } = this.context;

    const payload = PostRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { username, password } = payload;

    let hashedPassword = await passwordHasher.hash("");
    const existingUser = await this.#userDAO.findByUsername({ username });

    if (existingUser) {
      hashedPassword = existingUser.password;
    } else {
      throw new HTTPError(HTTP_NOT_FOUND, "User does not exist");
    }

    if (!(await passwordHasher.verify(hashedPassword, password))) {
      throw new HTTPError(HTTP_FORBIDDEN, "Incorrect password");
    }

    if (!existingUser.isActive) {
      throw new HTTPError(HTTP_FORBIDDEN, "Account is inactive");
    }

    await this.#userDAO.update({ username }, { isOnline: true });

    const token = jwt.encode({ userId: existingUser.userId });
    const { privilege } = existingUser;
    const responseBody = PostResponseSchema.parse({
      token,
      privilege
    });
    res.status(HTTP_CREATED);
    res.json(responseBody);
    logger.info({ context: loggerContext }, `User ${username} has logged in`);
  }

  async handleDelete(req, res) {
    const loggerContext = "TokenControllerDELETEHandler";
    const { userId } = req.auth;

    const payload = DeleteRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    // const user = this.#userDAO.findById({ userId });

    await this.#userDAO.updateById({ userId }, { isOnline: false });

    const responseBody = DeleteResponseSchema.parse({});
    res.json(responseBody);
    logger.info({ context: loggerContext }, `User ${userId} has logged out`);
  }
}
