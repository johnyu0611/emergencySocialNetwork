import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PostRequestSchema,
  PostResponseSchema,
  DeleteRequestSchema,
  PutRequestSchema
} from "@/controller/schema/MedicalCenter.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { MedicalCenterDataAccess } from "@/model/MedicalCenter.mjs";
import {
  HTTP_CONFLICT,
  HTTP_CREATED,
  HTTP_OK,
  HTTP_BAD_REQUEST,
  HTTP_FORBIDDEN,
  HTTP_NOT_FOUND
} from "@/util/Constants.mjs";
import { z } from "zod";
import { v7 as uuid } from "uuid";
import { DeleteResponseSchema } from "./schema/Token.mjs";
import { validateTitle } from "@/util/ValidateTitle.mjs";
import { validateLocation } from "@/util/ValidateLocation.mjs";

export class MedicalCenterController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #medicalDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== MedicalCenterController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#medicalDAO = MedicalCenterDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/medicalcenters"
  ) {
    if (!MedicalCenterController.#instance) {
      MedicalCenterController.#instance = new MedicalCenterController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: MedicalCenterController.#initializationSymbol
      });
    }
    return MedicalCenterController.#instance;
  }

  setUserDAO(medicalDAO) {
    this.#medicalDAO = medicalDAO;
  }

  async handlePost(req, res) {
    const loggerContext = "MedicalCenterControllerPOSTHandler";
    const { username } = req.auth;

    const payload = PostRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { introduction, address } = payload;

    let { location, title } = payload;

    try {
      title = validateTitle(title);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0].message;
        throw new HTTPError(HTTP_BAD_REQUEST, errorMessage);
      } else {
        throw error;
      }
    }

    try {
      location = validateLocation(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0].message;
        throw new HTTPError(HTTP_BAD_REQUEST, errorMessage);
      } else {
        throw error;
      }
    }

    const existingMedical = await this.#medicalDAO.findByAddress({ address });

    if (existingMedical) {
      console.log("mc");
      throw new HTTPError(HTTP_CONFLICT, "MC already exists");
    }

    const mcId = uuid();
    await this.#medicalDAO.create({
      mcId,
      author: username,
      location: location,
      title: title,
      introduction: introduction,
      address: address
    });

    const responseBody = PostResponseSchema.parse({
      id: mcId
    });

    res.status(HTTP_CREATED);
    res.json(responseBody);
    logger.info(
      { context: loggerContext },
      `Medical Center ${username} has created`
    );
  }

  async handleGet(req, res) {
    const loggerContext = "MedicalCenterControllerGETHandler";
    const { username } = req.auth;
    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const medicalcenter = await this.#medicalDAO.findAll();
    const medicalcenters = medicalcenter.map((center) => {
      const { _doc } = center;
      return {
        ..._doc,
        isUser: _doc.author === username
      };
    });
    const responseBody = GetResponseSchema.parse({
      medicalcenters
    });
    res.json(responseBody);
    res.status(HTTP_OK);
  }

  async handleDelete(req, res) {
    const loggerContext = "MedicalCenterControllerDELETEHandler";
    const payload = DeleteRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { mcId } = payload;
    const deleteMC = await this.#medicalDAO.deleteByMcId({ mcId });
    if (!deleteMC) {
      throw new HTTPError(HTTP_CONFLICT, "MC not exists");
    }
    const responseBody = DeleteResponseSchema.parse({
      id: mcId
    });
    res.json(responseBody);
    res.status(HTTP_OK);
  }

  async handlePut(req, res) {
    const loggerContext = "MedicalCenterControllerPUTHandler";
    const { username } = req.auth;

    const payload = PutRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { introduction, mcId } = payload;

    try {
      if (!mcId) {
        throw new HTTPError(HTTP_BAD_REQUEST, "Address is required");
      }

      const existingMedical = await this.#medicalDAO.findByMCID({ mcId });

      if (!existingMedical) {
        throw new HTTPError(HTTP_NOT_FOUND, "Medical Center not found");
      }

      if (existingMedical.author !== username) {
        throw new HTTPError(
          HTTP_FORBIDDEN,
          "You do not have permission to update this Medical Center"
        );
      }

      await this.#medicalDAO.updateIntroductionByMCID({
        mcId,
        introduction
      });

      logger.info(
        { context: loggerContext },
        `Introduction updated for address: ${mcId} by ${username}`
      );
      res
        .status(HTTP_OK)
        .json({ message: "Introduction updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0].message;
        throw new HTTPError(HTTP_BAD_REQUEST, errorMessage);
      } else {
        logger.error(
          { context: loggerContext },
          "Error updating introduction: %o",
          error
        );
        throw error;
      }
    }
  }
}
