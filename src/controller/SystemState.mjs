import { sleep } from "../../public/common/utils.mjs";
import { config } from "@/config/Config.mjs";
import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema,
  PutRequestSchema,
  PutResponseSchema
} from "@/controller/schema/SystemState.mjs";
import { MongoDBConnection } from "@/database/Connections.mjs";
import { SystemState } from "@/enum/SystemState.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
// import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { runtimeStore } from "@/store/Runtime.mjs";
import {
  CHANNEL_SYSTEM_EVENT_SYSTEM_MAINTENANCE,
  HTTP_BAD_REQUEST
} from "@/util/Constants.mjs";
import { parseError } from "@/util/ErrorParser.mjs";

export class TestController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== TestController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/system/state"
  ) {
    if (!TestController.#instance) {
      TestController.#instance = new TestController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: TestController.#initializationSymbol
      });
    }
    return TestController.#instance;
  }

  async handleGet(req, res) {
    const loggerContext = "SystemStateControllerGETHandler";

    try {
      const payload = GetRequestSchema.parse(req.body);
      logger.debug({ context: loggerContext }, "Request received: %o", payload);

      const response = GetResponseSchema.parse({
        state: runtimeStore.systemState.toString()
      });
      res.json(response);
    } catch (error) {
      const { reason, statusCode } = parseError(error);
      res.status(statusCode).json({ reason });
    }
  }

  async handlePut(req, res) {
    const loggerContext = "SystemStateControllerPUTHandler";

    try {
      const payload = PutRequestSchema.parse(req.body);
      logger.debug({ context: loggerContext }, "Request received: %o", payload);

      const { state } = payload;

      switch (state) {
        case "performanceTest":
          this.context.channel.system.emit(
            CHANNEL_SYSTEM_EVENT_SYSTEM_MAINTENANCE
          );
          await sleep(1000);
          runtimeStore.systemState = SystemState.PERFORMANCE_TEST;
          await MongoDBConnection.getNewConnection(
            config.environment.testDatabaseUser,
            config.environment.testDatabasePassword,
            config.environment.testDatabaseCluster,
            config.environment.testDatabaseName,
            config.environment.testDatabaseAppName
          );
          break;

        case "normal":
          await MongoDBConnection.dropDB();
          // Switch back to main database
          await MongoDBConnection.getNewConnection(
            config.environment.databaseUser,
            config.environment.databasePassword,
            config.environment.databaseCluster,
            config.environment.databaseName,
            config.environment.databaseAppName
          );
          runtimeStore.systemState = SystemState.NORMAL;
          break;

        default:
          throw new HTTPError(
            HTTP_BAD_REQUEST,
            `Unknown system state: ${state}`
          );
      }

      logger.info(
        { context: loggerContext },
        `System state has changed to ${state}`
      );
      const responseBody = PutResponseSchema.parse({});
      res.json(responseBody);
    } catch (error) {
      const { reason, statusCode } = parseError(error);
      res.status(statusCode).json({ reason });
    }
  }
}
