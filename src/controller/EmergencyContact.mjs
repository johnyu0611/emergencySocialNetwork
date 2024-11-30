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
    const { userId } = req.auth;
    const payload = PostRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    let { emergencyContact } = payload;

    console.log(emergencyContact);
    const { fullName } = emergencyContact;
    const { email } = emergencyContact;

    const user = await this.#userDAO.findByUsername({
      username: emergencyContact.username
    });

    const { username } = emergencyContact;

    if (!user) {
      throw new HTTPError(HTTP_NOT_FOUND, "Emergency contact not found");
    }

    if (userId === user.userId) {
      throw new HTTPError(
        HTTP_BAD_REQUEST,
        "Cannot set self as emergency contact"
      );
    }

    const curr = await this.#userDAO.findById({ userId });
    if (
      user.emergencyContactTo &&
      user.emergencyContactTo !== userId &&
      user.emergencyContactTo !== -1
    ) {
      throw new HTTPError(HTTP_BAD_REQUEST, "Emergency contact not available");
    }

    emergencyContact = {
      username: user.userId,
      fullName: fullName,
      email: email
    };
    console.log(emergencyContact);

    if (curr.emergencyContact) {
      await this.#userDAO.updateById(
        { userId: curr.emergencyContact.username },
        { emergencyContactTo: -1 }
      );
    }

    await this.#userDAO.updateById({ userId }, { emergencyContact });

    await this.#userDAO.updateById(
      { userId: emergencyContact.username },
      { emergencyContactTo: userId }
    );

    const responseBody = PostResponseSchema.parse({
      emergencyContact: username
    });
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${userId} has updated emergency contact to ${username}`
    );
  }

  async handleGet(req, res) {
    const loggerContext = "EmergencyContactControllerGETHandler";
    const { userId } = req.auth;
    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const user = await this.#userDAO.findById({ userId });
    let { emergencyContact } = user;
    console.log(emergencyContact);
    let isOnline = false;
    if (!emergencyContact) {
      emergencyContact = "";
    } else {
      const emergencyContactUser = await this.#userDAO.findById({
        userId: emergencyContact.username
      });
      ({ isOnline } = emergencyContactUser);
      if (!user) {
        throw new HTTPError(HTTP_NOT_FOUND, "Emergency contact not found");
      }
    }
    const curr = await this.#userDAO.findById({ userId });
    const emergencyContactUser = await this.#userDAO.findById({
      userId: emergencyContact.username
    });
    const responseBody = GetResponseSchema.parse({
      curr: curr.username,
      username: emergencyContactUser ? emergencyContactUser.username : "",
      fullName: emergencyContact ? emergencyContact.fullName : "",
      email: emergencyContact ? emergencyContact.email : "",
      isOnline: isOnline
    });
    console.log(responseBody);
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${userId} has retrieved emergency contact`
    );
  }
}
