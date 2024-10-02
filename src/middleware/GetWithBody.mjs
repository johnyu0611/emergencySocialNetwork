import { logger } from "@/log/Logger.mjs";
import { HTTP_BAD_REQUEST } from "@/util/Constants.mjs";

export function getWithBody() {
  const loggerContext = "GetWithBodyMiddleware";

  return (req, res, next) => {
    if (req.method !== "GET") {
      logger.warn(
        { context: loggerContext },
        "Non-GET request received, ignoring"
      );
      next();
      return;
    }
    if (!req.query) {
      logger.warn(
        { context: loggerContext },
        "GET request without a query parameter received, defaulting to empty object"
      );
      req.body = {};
      next();
      return;
    }
    if (!req.query.body) {
      logger.warn(
        { context: loggerContext },
        "GET request without a body query parameter received, defaulting to empty object"
      );
      req.body = {};
      next();
      return;
    }

    try {
      req.body = JSON.parse(req.query.body);
      next();
    } catch (error) {
      logger.error({ context: loggerContext }, String(error));
      res.status(HTTP_BAD_REQUEST);
      res.end();
    }
  };
}
