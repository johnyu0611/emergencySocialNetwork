import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/User.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import {
  HTTP_CONFLICT,
  HTTP_CREATED,
  HTTP_OK,
  HTTP_BAD_REQUEST
} from "@/util/Constants.mjs";
import { validateUsername } from "@/util/ValidateUsername.mjs";
import { validatePassword } from "@/util/ValidatePassword.mjs";
import { z } from "zod";

export class UserController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #userDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== UserController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#userDAO = UserDataAccess.getInstance();
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

  setUserDAO(userDAO) {
    this.#userDAO = userDAO;
  }

  async handlePost(req, res) {
    const loggerContext = "UserControllerPOSTHandler";
    const { jwt, passwordHasher } = this.context;

    const payload = PostRequestSchema.parse(req.body);
    // console.log("0000000000");
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    let { username } = payload;
    let { password } = payload;
    const { status } = payload;

    // console.log("11111111111");
    try {
      username = validateUsername(username);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0].message;
        throw new HTTPError(HTTP_BAD_REQUEST, errorMessage);
      } else {
        throw error;
      }
    }
    // console.log("22222222222");
    try {
      password = validatePassword(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0].message;
        throw new HTTPError(HTTP_BAD_REQUEST, errorMessage);
      } else {
        throw error;
      }
    }

    const existingUser = await this.#userDAO.findByUsername({ username });

    if (existingUser) {
      throw new HTTPError(HTTP_CONFLICT, "User already exists");
    }

    const newUser = await this.#userDAO.create({
      username,
      password: await passwordHasher.hash(password),
      status: status ? status : "Undefined"
    });

    const token = jwt.encode({ userId: newUser.userId });
    const responseBody = PostResponseSchema.parse({
      token
    });
    await this.#userDAO.update({ username }, { isOnline: true });

    res.status(HTTP_CREATED);
    res.json(responseBody);
    logger.info({ context: loggerContext }, `User ${username} has joined`);
  }

  async handleGet(req, res) {
    const loggerContext = "UserControllerGETHandler";

    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const searchByUsername = payload.searchBy?.username ?? ".*";
    const searchByStatus = payload.searchBy?.status ?? ".*";

    const users = await this.#userDAO.find({
      $and: [
        { username: { $regex: searchByUsername, $options: "i" } },
        { status: { $regex: searchByStatus, $options: "i" } }
      ]
    });

    const responseBody = GetResponseSchema.parse({
      users
    });
    res.json(responseBody);
    res.status(HTTP_OK);
  }
}
