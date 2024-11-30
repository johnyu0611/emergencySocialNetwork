import { AbstractController } from "@/controller/Abstract.mjs";
import { ZodError } from "zod";
import {
  PostApplicationRequestSchema,
  DeleteApplicationRequestSchema
} from "@/controller/schema/Application.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { ApplicationDataAccess } from "@/model/Application.mjs";
import { ResourceDataAccess } from "@/model/Resource.mjs";
import { v4 as uuidv4 } from "uuid";
import {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_BAD_REQUEST,
  HTTP_FORBIDDEN
} from "@/util/Constants.mjs";

export class ApplicationController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #resourceDAO = null;
  #applicationDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== ApplicationController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#applicationDAO = ApplicationDataAccess.getInstance();
    this.#resourceDAO = ResourceDataAccess.getInstance();
  }

  setApplicationDAO(applicationDAO) {
    this.#applicationDAO = applicationDAO;
  }

  getResourceDAO() {
    return this.#resourceDAO;
  }

  setResourceDAO(resourceDAO) {
    this.#resourceDAO = resourceDAO;
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/applications"
  ) {
    if (!ApplicationController.#instance) {
      ApplicationController.#instance = new ApplicationController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: ApplicationController.#initializationSymbol
      });
    }
    return ApplicationController.#instance;
  }

  /**
   * Handle POST /api/applications
   * Creates a new application for a resource.
   */

  async handlePost(req, res) {
    const loggerContext = "ApplicationControllerPOSTHandler";

    if (!req.auth || !req.auth.userId) {
      logger.error({ context: loggerContext }, "Unauthorized access attempt");
      throw new HTTPError(
        HTTP_FORBIDDEN,
        "User is not authorized to perform this action"
      );
    }

    const { userId: applicantUserId } = req.auth;
    const payload = {
      id: uuidv4(), // Generate unique ID
      resourceId: req.body.resourceId, // Resource ID from the frontend
      resourceName: req.body.resourceName,
      amount: req.body.amount,
      actionType: req.body.actionType,
      applicantUserId, // From auth token
      resourceOwnerId: req.body.resourceOwnerId, // From the frontend
      createdAt: new Date()
    };

    try {
      // Validate the payload
      const validatedPayload = PostApplicationRequestSchema.parse(payload);
      const savedApplication =
        await this.#applicationDAO.create(validatedPayload);
      res.status(HTTP_OK).json({
        id: savedApplication.id,
        timestamp: savedApplication.createdAt
      });

      logger.info(
        { context: loggerContext },
        `Application for resource "${validatedPayload.resourceName}" submitted by ${applicantUserId}`
      );
    } catch (error) {
      if (error instanceof ZodError) {
        // Import ZodError from your validation library
        throw new HTTPError(HTTP_BAD_REQUEST, "Validation failed");
      }
      logger.error(
        { context: loggerContext },
        "Error saving application: %o",
        error
      );
      throw new HTTPError(HTTP_BAD_REQUEST, "Failed to submit application");
    }
  }

  /**
   * Handle GET /api/applications
   * Retrieves applications for the authenticated user.
   */
  async handleGet(req, res) {
    const loggerContext = "ApplicationControllerGETHandler";

    if (!req.auth || !req.auth.userId) {
      logger.error({ context: loggerContext }, "Unauthorized access attempt");
      throw new HTTPError(
        HTTP_FORBIDDEN,
        "User is not authorized to view applications"
      );
    }

    const { userId } = req.auth;

    try {
      const applications = await this.#applicationDAO.findByUserId(userId);
      res.status(HTTP_OK).json({ applications, total: applications.length });
      logger.info(
        { context: loggerContext },
        "Returned application list for user"
      );
    } catch (error) {
      logger.error(
        { context: loggerContext },
        "Error retrieving applications: %o",
        error
      );
      throw new HTTPError(HTTP_BAD_REQUEST, "Failed to retrieve applications");
    }
  }

  async handleDelete(req, res) {
    const loggerContext = "ApplicationControllerDELETEHandler";

    if (!req.auth || !req.auth.userId) {
      logger.error({ context: loggerContext }, "Unauthorized access attempt");
      throw new HTTPError(
        HTTP_FORBIDDEN,
        "User is not authorized to delete applications"
      );
    }

    try {
      // Validate payload
      const { id } = DeleteApplicationRequestSchema.parse(req.body);

      const result = await this.#applicationDAO.deleteById(id);

      if (!result) {
        throw new HTTPError(HTTP_NOT_FOUND, "Application not found");
      }

      res.status(HTTP_OK).json({ message: "Application successfully deleted" });
      logger.info(
        { context: loggerContext },
        `Application ${id} deleted by ${req.auth.userId}`
      );
    } catch (error) {
      if (error instanceof ZodError) {
        throw new HTTPError(HTTP_BAD_REQUEST, "Validation failed");
      }

      if (error instanceof HTTPError) {
        // Re-throw any HTTPError without modification
        throw error;
      }

      logger.error(
        { context: loggerContext, error: error.stack || error.message },
        "Error deleting application"
      );
      throw new HTTPError(HTTP_BAD_REQUEST, "Failed to delete application");
    }
  }
}
