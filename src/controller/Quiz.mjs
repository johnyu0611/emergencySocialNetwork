import { AbstractController } from "@/controller/Abstract.mjs";
import {
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/Quiz.mjs";
import { logger } from "@/log/Logger.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import { QuizDataAccess } from "@/model/Quiz.mjs";
import { HTTP_CREATED, HTTP_BAD_REQUEST } from "@/util/Constants.mjs";

export class QuizController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #userDAO = null;
  #quizDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== QuizController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#userDAO = UserDataAccess.getInstance();
    this.#quizDAO = QuizDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/quizzes"
  ) {
    if (!QuizController.#instance) {
      QuizController.#instance = new QuizController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: QuizController.#initializationSymbol
      });
    }
    return QuizController.#instance;
  }

  // async handlePost(req, res) {
  //   const loggerContext = "QuizControllerPOSTHandler";

  //   const { username } = req.auth;
  //   const payload = PostRequestSchema.parse({
  //     ...req.body,
  //     creator: username
  //   });
  //   logger.debug({ context: loggerContext }, "Request received: %o", payload);

  //   await this.#quizDAO.create(payload);

  //   const responseBody = PostResponseSchema.parse({
  //     success: true,
  //     message: "Quiz question created!"
  //   });
  //   res.status(HTTP_CREATED).json(responseBody);
  //   logger.info({ context: loggerContext }, responseBody.message);
  // }

  async handlePost(req, res) {
    const loggerContext = "QuizControllerPOSTHandler";

    try {
      const { userId } = req.auth;

      const user = await this.#userDAO.findById({ userId });

      const payload = PostRequestSchema.parse({
        ...req.body,
        creator: user.username
      });
      logger.debug({ context: loggerContext }, "Request received: %o", payload);

      await this.#quizDAO.create(payload);

      const responseBody = PostResponseSchema.parse({
        success: true,
        message: "New question created"
      });
      res.status(HTTP_CREATED).json(responseBody);
      logger.info({ context: loggerContext }, responseBody.message);
    } catch (error) {
      logger.error(
        { context: loggerContext, error },
        "Failed to create quiz question"
      );

      res.status(HTTP_BAD_REQUEST).json({
        success: false,
        message:
          "Failed to create quiz question. Please check your request and try again."
      });
    }
  }
}
