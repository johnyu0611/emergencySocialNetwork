import { AbstractController } from "@/controller/Abstract.mjs";
import {
  PostRequestSchema,
  PostResponseSchema,
  GetRequestSchema,
  GetResponseSchema
} from "@/controller/schema/User.mjs";
import { userDAO } from "@/database/UserDataAccess.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { UserModel } from "@/model/User.mjs";
import { HTTP_CONFLICT, HTTP_CREATED, HTTP_OK } from "@/util/Constants.mjs";
import { json } from "express";

export class UserController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== UserController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/users"
  ) {
    if (!UserController.#instance) {
      UserController.#instance = new UserController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: UserController.#initializationSymbol
      });
    }
    return UserController.#instance;
  }

  async handlePost(req, res) {
    const loggerContext = "UserControllerPOSTHandler";
    const { jwt, passwordHasher } = this.context;

    const payload = PostRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { username, password } = payload;
    const existingUser = await userDAO.getUserByUsername({ username });

    if (existingUser) {
      throw new HTTPError(HTTP_CONFLICT, "User already exists");
    }

    await userDAO.createUser({
      username,
      password: await passwordHasher.hash(password)
    });

    const token = jwt.encode({ username });
    const responseBody = PostResponseSchema.parse({
      token
    });
    userDAO.getUserOnline({ username });
    res.status(HTTP_CREATED);
    res.json(responseBody);
    logger.info({ context: loggerContext }, `User ${username} has joined`);
  }

  async handleGet(req, res) {
    const loggerContext = "UserControllerGETHandler";

    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const users = await userDAO.getAllUsers();

    const responseBody = GetResponseSchema.parse({
      users
    });
    res.json(responseBody);
    res.status(HTTP_OK);
  }
}
