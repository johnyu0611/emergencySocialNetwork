import { AbstractController } from "@/controller/Abstract.mjs";
import {
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/QuizChallenge.mjs";
import { logger } from "@/log/Logger.mjs";
import { QuizDataAccess } from "@/model/Quiz.mjs";
import { HTTP_OK, HTTP_CREATED, HTTP_BAD_REQUEST } from "@/util/Constants.mjs";

export class QuizChallengeController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #quizDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== QuizChallengeController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#quizDAO = QuizDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/challenges"
  ) {
    if (!QuizChallengeController.#instance) {
      QuizChallengeController.#instance = new QuizChallengeController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: QuizChallengeController.#initializationSymbol
      });
    }
    return QuizChallengeController.#instance;
  }

  async handlePost(req, res) {
    const loggerContext = "QuizChallengeControllerPOSTHandler";
    const { challenger, challenged } = PostRequestSchema.parse(req.body);

    try {
      logger.info(
        { context: loggerContext },
        `User ${challenger} is challenging ${challenged}`
      );

      // Fetch a random questionID
      const questionID = await this.#quizDAO.getRandomQuestionID();

      this.context.channel.system.emit("new_challenge", {
        challenger,
        challenged,
        questionID
      });

      const responseBody = PostResponseSchema.parse({
        message: "Challenge sent successfully.",
        questionID
      });
      res.status(HTTP_CREATED).json(responseBody);
    } catch (error) {
      logger.error({ context: loggerContext }, error.message || error);
      // throw new HTTPError(HTTP_BAD_REQUEST, "Failed to send the challenge.");
      res.status(HTTP_BAD_REQUEST).json({
        success: false,
        message:
          "Failed to send the challenge. Please check your request and try again."
      });
    }
  }

  async handlePut(req, res) {
    const loggerContext = "QuizChallengeControllerPUTHandler";

    const { challenger, challenged, questionID } = req.body;

    // const payload = PutRequestSchema.parse({
    //   challenger,
    //   challenged,
    //   questionID
    // });

    try {
      logger.info(
        { context: loggerContext },
        `Challenge accepted by ${challenged} from ${challenger} with questionID ${questionID}`
      );

      this.context.channel.system.emit("challenge_accepted", {
        challenger,
        challenged,
        questionID
      });

      //   if (isAccepted) {
      //     // Emit challenge_accepted event
      //     this.context.channel.system.emit("challenge_accepted", {
      //       challenger,
      //       challenged,
      //       questionID,
      //     });
      //     res.status(200).send({ message: "Challenge accepted!" });
      //   } else {
      //     // Emit challenge_declined event
      //     this.context.channel.system.emit("challenge_declined", {
      //       challenger,
      //       challenged,
      //     });
      //     res.status(200).send({ message: "Challenge declined!" });
      //   }

      res
        .status(HTTP_OK)
        .json({ success: true, message: "Challenge accepted!" });
    } catch (error) {
      logger.error({ context: loggerContext }, error.message || error);
      res
        .status(HTTP_BAD_REQUEST)
        .json({ success: false, message: "Failed to accept challenge." });
    }
  }
}
