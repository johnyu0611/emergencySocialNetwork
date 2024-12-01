import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/Administration.mjs";
import { PasswordHasher } from "@/util/PasswordHasher.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import { logger } from "@/log/Logger.mjs";
import { HTTP_OK } from "@/util/Constants.mjs";
import { validateUsername } from "@/util/ValidateUsername.mjs";
import { validatePassword } from "@/util/ValidatePassword.mjs";

export class AdministrationController extends AbstractController {
  static #initializationSymbol = Symbol("$$$");
  static #instance = null;
  #passwordHasher = null;
  #userDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== AdministrationController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#passwordHasher = new PasswordHasher({});
    this.#userDAO = UserDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/administration"
  ) {
    if (!AdministrationController.#instance) {
      AdministrationController.#instance = new AdministrationController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: AdministrationController.#initializationSymbol
      });
    }
    return AdministrationController.#instance;
  }

  setUserDAO(userDAO) {
    this.#userDAO = userDAO;
  }

  async handlePost(req, res) {
    const loggerContext = "AdministrationControllerPOSTHandler";
    const payload = PostRequestSchema.parse(req.body);
    const { citizenId, isActive, privilege, validation } = payload;
    let { username, password } = payload;

    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    if (validation === true) {
      let userFlag = "";
      let passwordFlag = "";
      if (username !== undefined) {
        try {
          username = validateUsername(username);
        } catch (error) {
          logger.debug({ context: loggerContext }, "Error received: %o", error);
          userFlag =
            "Username should be longer than 2 chars and shorter than 32 chars without banned names";
        }

        const user = await this.#userDAO.findByUsername({ username });

        if (user) {
          userFlag = "Username unavailable";
        }
      }

      if (password !== undefined) {
        try {
          password = validatePassword(password);
        } catch (error) {
          logger.debug({ context: loggerContext }, "Error received: %o", error);
          passwordFlag =
            "Password should be longer than 3 chars and shorter than 64 chars";
        }
      }

      const responseBody = PostResponseSchema.parse({
        citizenId: citizenId,
        userFlag,
        passwordFlag
      });

      res.status(HTTP_OK);
      res.json(responseBody);

      logger.info(
        { context: loggerContext },
        `Validate username ${userFlag} and password ${passwordFlag}, `
      );
      return;
    }

    const update = {};

    if (isActive !== undefined) {
      update.isActive = isActive;
      if (isActive === false) {
        this.context.channel.system.emit("user_logout", { citizenId });
      } else {
        this.context.channel.system.emit("user_active", { citizenId });
      }
    }

    if (password !== undefined) {
      update.password = await this.#passwordHasher.hash(password);
    }

    if (username !== undefined) {
      update.username = username;
      this.context.channel.system.emit("username_change");
    }

    console.log(privilege);
    if (privilege !== undefined) {
      update.privilege = privilege;
    }

    await this.#userDAO.updateById({ userId: citizenId }, update);

    const updateUser = await this.#userDAO.findById({ userId: citizenId });

    const responseBody = PostResponseSchema.parse({
      citizenId: citizenId,
      privilege: updateUser.privilege,
      status: updateUser.status,
      isActive: updateUser.isActive,
      isOnline: updateUser.isOnline,
      username: updateUser.username
    });

    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${citizenId} has been updated to username: ${updateUser.username}, privilege: ${updateUser.privilege}, isActive: ${updateUser.isActive}, `
    );
  }

  async handleGet(req, res) {
    const loggerContext = "AdministrationControllerGETHandler";
    const payload = GetRequestSchema.parse(req.body);
    const { citizenId } = payload;

    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const citizen = await this.#userDAO.findById({ userId: citizenId });

    const responseBody = GetResponseSchema.parse({
      citizenId: citizenId,
      privilege: citizen.privilege,
      status: citizen.status,
      isActive: citizen.isActive,
      isOnline: citizen.isOnline,
      username: citizen.username
    });

    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `Retrieved citizen ${citizen.username} information`
    );
  }
}
