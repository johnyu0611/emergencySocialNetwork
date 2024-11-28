import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/EmergencyContact.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_BAD_REQUEST
} from "@/util/Constants.mjs";

export class EmergencyContactController extends AbstractController {
  static #initializationSymbol = Symbol("$");
  static #instance = null;
  #userDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== EmergencyContactController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#userDAO = UserDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/emergency-contact"
  ) {
    if (!EmergencyContactController.#instance) {
      EmergencyContactController.#instance = new EmergencyContactController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: EmergencyContactController.#initializationSymbol
      });
    }
    return EmergencyContactController.#instance;
  }

  setUserDAO(userDAO) {
    this.#userDAO = userDAO;
  }

  async handlePost(req, res) {
    const loggerContext = "EmergencyContactControllerPOSTHandler";
    const { username } = req.auth;
    const payload = PostRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { emergencyContact } = payload;

    console.log(emergencyContact.username);

    if (username === emergencyContact.username) {
      throw new HTTPError(
        HTTP_BAD_REQUEST,
        "Cannot set self as emergency contact"
      );
    }

    const user = await this.#userDAO.findByUsername({
      username: emergencyContact.username
    });
    const curr = await this.#userDAO.findByUsername({ username });
    if (!user) {
      throw new HTTPError(HTTP_NOT_FOUND, "Emergency contact not found");
    }
    if (user.emergencyContactTo && user.emergencyContactTo !== username) {
      throw new HTTPError(HTTP_BAD_REQUEST, "Emergency contact not available");
    }

    await this.#userDAO.update({ username }, { emergencyContact });

    if (curr.emergencyContact) {
      await this.#userDAO.update(
        { username: curr.emergencyContact.username },
        { emergencyContactTo: "" }
      );
    }

    await this.#userDAO.update(
      { username: emergencyContact.username },
      { emergencyContactTo: username }
    );

    const responseBody = PostResponseSchema.parse({
      emergencyContact: emergencyContact.username
    });
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${username} has updated emergency contact to ${emergencyContact}`
    );
  }

  async handleGet(req, res) {
    const loggerContext = "EmergencyContactControllerGETHandler";
    const { username } = req.auth;
    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const user = await this.#userDAO.findByUsername({ username });
    let { emergencyContact } = user;
    let isOnline = false;
    if (!emergencyContact) {
      emergencyContact = "";
    } else {
      const emergencyContactUser = await this.#userDAO.findByUsername({
        username: emergencyContact.username
      });
      ({ isOnline } = emergencyContactUser);
      if (!user) {
        throw new HTTPError(HTTP_NOT_FOUND, "Emergency contact not found");
      }
    }

    const responseBody = GetResponseSchema.parse({
      curr: username,
      username: emergencyContact ? emergencyContact.username : "",
      fullName: emergencyContact ? emergencyContact.fullName : "",
      email: emergencyContact ? emergencyContact.email : "",
      isOnline: isOnline
    });
    console.log(responseBody);
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${username} has retrieved emergency contact`
    );
  }
}
