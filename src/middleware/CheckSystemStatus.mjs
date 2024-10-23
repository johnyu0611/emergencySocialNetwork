import { SystemState } from "@/enum/SystemState.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { runtimeStore } from "@/store/Runtime.mjs";
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_SERVICE_UNAVAILABLE
} from "@/util/Constants.mjs";
import { parseError } from "@/util/ErrorParser.mjs";

const loggerContext = "CheckSystemStatusMiddleware";

export function checkSystemStatus() {
  return (request, response, next) => {
    const { systemState } = runtimeStore;

    try {
      switch (systemState) {
        case SystemState.PERFORMANCE_TEST:
          throw new HTTPError(
            HTTP_SERVICE_UNAVAILABLE,
            "Server unavailable for now"
          );

        case SystemState.NORMAL:
          next();
          break;

        default:
          throw new HTTPError(
            HTTP_INTERNAL_SERVER_ERROR,
            `Unknown system state: ${systemState}`
          );
      }
    } catch (error) {
      logger.error({ context: loggerContext }, String(error));
      const { reason, statusCode } = parseError(error);
      response.status(statusCode).json({ reason });
    }
  };
}

export function checkSystemStatusSocketIO() {
  return (socket, next) => {
    const { systemState } = runtimeStore;

    try {
      switch (systemState) {
        case SystemState.PERFORMANCE_TEST:
          throw new HTTPError(
            HTTP_SERVICE_UNAVAILABLE,
            "Server unavailable for now"
          );

        case SystemState.NORMAL:
          next();
          break;

        default:
          throw new HTTPError(
            HTTP_INTERNAL_SERVER_ERROR,
            `Unknown system state: ${systemState}`
          );
      }
    } catch (error) {
      logger.error({ context: loggerContext }, String(error));
      next(error);
    }
  };
}
