import { AbstractController } from "@/controller/AbstractController.mjs";
import {
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/Users.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { UserModal } from "@/model/User.mjs";
import { HTTP_CONFLICT, HTTP_CREATED } from "@/util/Constants.mjs";
import { json } from "express";

export class UserController extends AbstractController {
  static #initializationSymbol = Symbol();
  static #instance = null;

  constructor({ upstreamRouter, path, context, symbol }) {
    if (symbol !== UserController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, context });
    this.router.use(json());
  }

  static getInstance({ upstreamRouter, context = {}, path = "/users" }) {
    if (UserController.#instance == null) {
      UserController.#instance = new UserController({
        upstreamRouter,
        path,
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
    const existingUser = await UserModal.findOne({ username });

    if (existingUser) {
      throw new HTTPError(HTTP_CONFLICT, "User already exists");
    }

    const newUser = new UserModal({
      username,
      password: await passwordHasher.hash(password)
    });
    await newUser.save();

    const token = jwt.encode({ username });
    const responseBody = PostResponseSchema.parse({
      token
    });
    res.status(HTTP_CREATED);
    res.json(responseBody);
    logger.info({ context: loggerContext }, `User ${username} has joined`);
  }
}
