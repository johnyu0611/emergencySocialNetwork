import { logger } from "@/log/Logger.mjs";
import { HTTP_FORBIDDEN, HTTP_UNAUTHORIZED } from "@/util/Constants.mjs";

const loggerContext = "AuthMiddleware";

export function auth(jwt) {
  return (request, response, next) => {
    const { authorization } = request.headers;
    if (!authorization) {
      logger.error({ context: loggerContext }, "Unauthorized request");
      response.status(HTTP_UNAUTHORIZED);
      response.end();
      return;
    }

    if (!authorization.startsWith("Bearer ")) {
      logger.error(
        { context: loggerContext },
        `Malformed Authorization header: ${authorization}`
      );
      response.status(HTTP_FORBIDDEN);
      response.end();
      return;
    }

    const token = authorization.replace("Bearer ", "");

    try {
      const authPayload = jwt.decode(token);
      request.auth = { userId: authPayload.userId };
      next();
    } catch (error) {
      logger.error({ context: loggerContext }, String(error));
      response.status(HTTP_FORBIDDEN);
      response.end();
    }
  };
}

export function authSocketIO(jwt) {
  return (socket, next) => {
    const { token } = socket.handshake.auth;

    try {
      const { userId } = jwt.decode(token);
      if (!userId) {
        throw new Error(`Invalid token: ${token}`);
      }
      socket.handshake.auth = { token, userId };
      next();
    } catch (error) {
      logger.error({ context: loggerContext }, String(error));
      next(error);
    }
  };
}
