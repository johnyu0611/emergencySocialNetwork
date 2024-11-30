import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/Review.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { HTTP_CREATED, HTTP_OK, HTTP_BAD_REQUEST } from "@/util/Constants.mjs";
import { ReviewDataAccess } from "@/model/Review.mjs";
import { MedicalCenterDataAccess } from "@/model/MedicalCenter.mjs";
import { validateRate } from "@/util/ValidateRate.mjs";
import { z } from "zod";
import { UserDataAccess } from "@/model/User.mjs";

export class ReviewController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #reviewDAO = null;
  #medicalDAO = null;
  #userDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== ReviewController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#reviewDAO = ReviewDataAccess.getInstance();
    this.#medicalDAO = MedicalCenterDataAccess.getInstance();
    this.#userDAO = UserDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/reviews"
  ) {
    if (!ReviewController.#instance) {
      ReviewController.#instance = new ReviewController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: ReviewController.#initializationSymbol
      });
    }
    return ReviewController.#instance;
  }

  setUserDAO(reviewDAO, medicalDAO, userDAO) {
    this.#reviewDAO = reviewDAO;
    this.#medicalDAO = medicalDAO;
    this.#userDAO = userDAO;
  }

  async handlePost(req, res) {
    const loggerContext = "ReviewControllerPOSTHandler";
    const { userId } = req.auth;

    const payload = PostRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { content, mcId } = payload;
    let { rate } = payload;

    try {
      rate = validateRate(rate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0].message;
        throw new HTTPError(HTTP_BAD_REQUEST, errorMessage);
      } else {
        throw error;
      }
    }

    const user = await this.#userDAO.findById({ userId });
    const { username } = user;

    await this.#reviewDAO.create({
      mcId,
      content,
      rate,
      timestamp: Date.now(),
      author: userId
    });

    const responseBody = PostResponseSchema.parse({
      id: mcId
    });

    res.status(HTTP_CREATED);
    res.json(responseBody);
    logger.info({ context: loggerContext }, `Review ${username} has created`);
  }

  async handleGet(req, res) {
    const loggerContext = "ReviewControllerGETHandler";
    const payload = GetRequestSchema.parse(req.body);
    const { mcId } = payload;
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const reviewAll = await this.#reviewDAO.findByMCID({ mcId });

    const reviews = await Promise.all(
      reviewAll.map(async (review) => {
        const userId = review.author;
        const user = await this.#userDAO.findById({ userId });
        return {
          // eslint-disable-next-line no-underscore-dangle
          ...review._doc,
          author: user ? user.username : "Unknown User"
        };
      })
    );

    const totalRating = reviews.reduce((sum, review) => sum + review.rate, 0);
    const averageRating =
      isNaN(totalRating) || reviews.length === 0
        ? 0
        : totalRating / reviews.length;
    const mc = await this.#medicalDAO.findByMCID({ mcId });
    const responseBody = GetResponseSchema.parse({
      reviews: reviews,
      mc: mc,
      rate: averageRating
    });
    res.json(responseBody);
    res.status(HTTP_OK);
  }
}
