import { AbstractController } from "@/controller/AbstractController.mjs";
import {
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/Tokens.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { UserModal } from "@/model/User.mjs";
import {
  HTTP_CREATED,
  HTTP_FORBIDDEN,
  HTTP_NOT_FOUND,
  HTTP_UNIMPLEMENTED
} from "@/util/Constants.mjs";
import { json } from "express";

export class TokenController extends AbstractController {
  static #initializationSymbol = Symbol();
  static #instance = null;

  constructor({ upstreamRouter, path, context, symbol }) {
    if (symbol !== TokenController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, context });
    this.router.use(json());
  }

  static getInstance({ upstreamRouter, context = {}, path = "/tokens" }) {
    if (TokenController.#instance == null) {
      TokenController.#instance = new TokenController({
        upstreamRouter,
        path,
        context,
        symbol: TokenController.#initializationSymbol
      });
    }
    return TokenController.#instance;
  }

  async handlePost(req, res) {
    const loggerContext = "TokenControllerPOSTHandler";
    const { jwt, passwordHasher } = this.context;

    const payload = PostRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { username, password } = payload;

    let hashedPassword = await passwordHasher.hash("");
    const existingUser = await UserModal.findOne({ username });

    if (existingUser) {
      hashedPassword = existingUser.password;
    } else {
      throw new HTTPError(HTTP_NOT_FOUND, "User does not exist");
    }

    if (!(await passwordHasher.verify(hashedPassword, password))) {
      throw new HTTPError(HTTP_FORBIDDEN, "Incorrect password");
    }

    const token = jwt.encode({ username });
    const responseBody = PostResponseSchema.parse({
      token
    });
    res.status(HTTP_CREATED);
    res.json(responseBody);
    logger.info({ context: loggerContext }, `User ${username} has logged in`);
  }

  handleDelete(req, res) {
    const loggerContext = "TokenControllerDELETEHandler";
    const { jwt } = this.context;
    throw new HTTPError(HTTP_UNIMPLEMENTED, "Unimplemented");
  }
}
