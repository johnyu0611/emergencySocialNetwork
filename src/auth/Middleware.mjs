import { logger } from "@/log/Logger.mjs";
import { HTTP_FORBIDDEN, HTTP_UNAUTHORIZED } from "@/util/Constants.js";

export function auth(jwt) {
  const loggerContext = "AuthMiddleware";

  return (request, response, next) => {
    const { authorization } = request.headers;
    if (!authorization) {
      response.status(HTTP_UNAUTHORIZED);
      response.end();
      return;
    }

    if (!authorization.startsWith("Bearer ")) {
      response.status(HTTP_FORBIDDEN);
      response.end();
      return;
    }

    const token = authorization.replace("Bearer ", "");

    try {
      const authPayload = jwt.decode(token);
      request.auth = { username: authPayload.username };
      next();
    } catch (error) {
      logger.error({ context: loggerContext }, String(error));
      response.status(HTTP_FORBIDDEN);
      response.end();
    }
  };
}
