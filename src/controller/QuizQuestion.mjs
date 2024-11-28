import { AbstractController } from "@/controller/Abstract.mjs";
// import {
//   PostRequestSchema,
//   PostResponseSchema
// } from "@/controller/schema/Quiz.mjs";
import { logger } from "@/log/Logger.mjs";
import { QuizDataAccess } from "@/model/Quiz.mjs";
import { HTTP_OK, HTTP_BAD_REQUEST } from "@/util/Constants.mjs";

export class QuizQuestionController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #quizDAO = null;

  static #challengeStateMap = new Map();

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== QuizQuestionController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#quizDAO = QuizDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/:questionID"
  ) {
    if (!QuizQuestionController.#instance) {
      QuizQuestionController.#instance = new QuizQuestionController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: QuizQuestionController.#initializationSymbol
      });
    }
    return QuizQuestionController.#instance;
  }

  async handleGet(req, res) {
    const loggerContext = "QuizQuestionControllerGETHandler";
    const { questionID } = req.params;

    try {
      let quiz = undefined;

      if (questionID) {
        quiz = await this.#quizDAO.getQuestionByID(questionID);
      } else {
        quiz = await this.#quizDAO.fetchRandom();
      }

      if (!quiz) {
        res.status(404).json({ message: "Question not found." });
        return;
      }

      res.status(HTTP_OK).json({
        description: quiz.description,
        answer: quiz.answer
      });
    } catch (error) {
      logger.error({ context: loggerContext }, error.message || error);
      res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "Failed to fetch question." });
    }
  }

  //   async handlePost(req, res) {
  //     const loggerContext = "QuizQuestionControllerPOSTHandler";
  //     const { username } = req.auth; // Get the user submitting the answer
  //     const { questionID, answer } = req.body;

  //     // Define a unique key for this challenge
  //     const challengeKey = `challenge_${questionID}`;

  //     try {
  //       logger.info(
  //         { context: loggerContext },
  //         `User ${username} submitted an answer for questionID ${questionID}: ${answer}`
  //       );

  //       // Fetch the question from the database
  //       const question = await this.#quizDAO.getQuestionByID(questionID);
  //       if (!question) {
  //         res.status(404).json({ message: "Question not found." });
  //         return;
  //       }

  //       // Check the user's answer
  //       const isCorrect = question.answer === answer;
  //       // const isCorrect = await this.#quizDAO.checkAnswer(questionID, userAnswer);

  //       // Get or initialize the challenge state
  //       const challengeState =
  //         QuizQuestionController.#challengeStateMap.get(challengeKey) || {
  //           questionID,
  //           choices: {}, // Map of username to their result
  //         };

  //       challengeState.choices[username] = isCorrect ? "correct" : "wrong";

  //       // Update the map
  //       QuizQuestionController.#challengeStateMap.set(challengeKey, challengeState);

  //       // Check if both users have submitted their answers
  //       if (Object.keys(challengeState.choices).length === 2) {
  //         const resultData = {
  //           questionID,
  //           results: challengeState.choices,
  //         };

  //         // Emit the "result_available" event with the results
  //         this.context.channel.system.emit("result_available", resultData);

  //         // Clear the challenge state from the map
  //         QuizQuestionController.#challengeStateMap.delete(challengeKey);
  //       }

  //       // Respond with success
  //       res.status(200).json({
  //         success: true,
  //         message: "Answer submitted successfully.",
  //         isCorrect,
  //       });
  //     } catch (error) {
  //       logger.error({ context: loggerContext }, error.message || error);
  //       res.status(500).json({ message: "Failed to submit the answer." });
  //     }
  //   }

  async handlePost(req, res) {
    const loggerContext = "QuizQuestionControllerPOSTHandler";
    const { username } = req.auth; // User submitting the answer
    const { questionID, answer, challenger, challenged } = req.body;

    if (!challenger || !challenged) {
      res
        .status(400)
        .json({ message: "Challenger or challenged user missing." });
      return;
    }

    // Define a unique key for this challenge
    const challengeKey = `challenge_${challenger}_${challenged}_${questionID}`;

    try {
      logger.info(
        { context: loggerContext },
        `User ${username} submitted an answer for questionID ${questionID}: ${answer}`
      );

      // Fetch the question from the database
      const question = await this.#quizDAO.getQuestionByID(questionID);
      if (!question) {
        res.status(404).json({ message: "Question not found." });
        return;
      }

      // Check the user's answer
      const isCorrect = question.answer === answer;

      // Get or initialize the challenge state
      const challengeState = QuizQuestionController.#challengeStateMap.get(
        challengeKey
      ) || {
        questionID,
        participants: [challenger, challenged],
        choices: {} // Map of username to their result
      };

      challengeState.choices[username] = isCorrect ? "correct" : "wrong";

      // Update the map
      QuizQuestionController.#challengeStateMap.set(
        challengeKey,
        challengeState
      );

      // Check if both users have submitted their answers
      if (Object.keys(challengeState.choices).length === 2) {
        const resultData = {
          questionID,
          participants: challengeState.participants,
          results: challengeState.choices
        };

        // Emit the "result_available" event with the results
        this.context.channel.system.emit("result_available", resultData);

        // Clear the challenge state from the map
        QuizQuestionController.#challengeStateMap.delete(challengeKey);
      }

      // Respond with success
      res.status(200).json({
        message: "Answer submitted successfully.",
        isCorrect
      });
    } catch (error) {
      logger.error({ context: loggerContext }, error.message || error);
      res.status(500).json({ message: "Failed to submit the answer." });
    }
  }
}
