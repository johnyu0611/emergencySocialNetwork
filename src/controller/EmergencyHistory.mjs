import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PostRequestSchema,
  PostResponseSchema,
  DeleteRequestSchema
} from "@/controller/schema/EmergencyHistory.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import { HTTP_OK, HTTP_NOT_FOUND } from "@/util/Constants.mjs";

export class EmergencyHistoryController extends AbstractController {
  static #initializationSymbol = Symbol("$$");
  static #instance = null;
  #userDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== EmergencyHistoryController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#userDAO = UserDataAccess.getInstance();
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/emergency-history"
  ) {
    if (!EmergencyHistoryController.#instance) {
      EmergencyHistoryController.#instance = new EmergencyHistoryController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: EmergencyHistoryController.#initializationSymbol
      });
    }
    return EmergencyHistoryController.#instance;
  }

  setUserDAO(userDAO) {
    this.#userDAO = userDAO;
  }

  async handlePost(req, res) {
    const loggerContext = "EmergencyHistoryControllerPOSTHandler";
    const { username } = req.auth;
    const payload = PostRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    const { sender, content } = payload;

    console.log(`${sender} send ${content}`);

    const user = await this.#userDAO.findByUsername({ username });
    if (!user) {
      throw new HTTPError(HTTP_NOT_FOUND, "User not found");
    }

    await this.#userDAO.update(
      { username: user.emergencyContactTo },
      {
        $push: {
          emergencyHistory: {
            sender: username,
            content,
            timestamp: new Date().setMilliseconds(0)
          }
        }
      }
    );

    this.context.channel.system.emit("new_emergency_history");

    const responseBody = PostResponseSchema.parse({
      sender: username,
      // timestamp: new Date().setMilliseconds(0),
      content: content
    });
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${username} has logged emergency info for ${user.emergencyContactTo}`
    );
  }

  async handleGet(req, res) {
    const loggerContext = "EmergencyHistoryControllerGETHandler";
    const { username } = req.auth;
    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);
    const { who } = payload;

    let user = await this.#userDAO.findByUsername({ username });
    let history = undefined;
    if (who === "other") {
      user = await this.#userDAO.findByUsername({
        username: user.emergencyContactTo
      });

      if (user && user.emergencyHistory) {
        user.emergencyHistory.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
      }

      history = user.emergencyHistory.map(({ sender, timestamp, content }) => ({
        sender: sender || undefined,
        timestamp: timestamp ? timestamp : undefined,
        content: content || undefined
      }));
    } else if (who === "self") {
      if (user && user.emergencyHistory) {
        user.emergencyHistory.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
      }

      history = user.emergencyHistory.map(({ sender, timestamp, content }) => ({
        sender: sender || undefined,
        timestamp: timestamp ? timestamp : undefined,
        content: content || undefined
      }));
    }

    const responseBody = GetResponseSchema.parse({ history });
    console.log(responseBody);
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${username} has retrieved emergency info`
    );
  }

  async handleDelete(req, res) {
    const loggerContext = "EmergencyHistoryControllerGETHandler";
    const { username } = req.auth;
    // console.log(req.body);
    const payload = DeleteRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);
    const { sender, timestamp, content } = payload;

    const timestampDate = new Date(timestamp).toISOString();
    console.log(timestampDate);
    const result = await this.#userDAO.update(
      { username },
      {
        $pull: {
          emergencyHistory: {
            sender: sender,
            timestamp: timestampDate,
            content: content
          }
        }
      }
    );

    this.context.channel.system.emit("new_emergency_history");

    console.log(result);
    const responseBody = { message: "Emergency history deleted successfully" };
    console.log(responseBody);
    res.status(HTTP_OK);
    res.json(responseBody);

    logger.info(
      { context: loggerContext },
      `User ${username} has retrieved emergency info`
    );
  }
}
