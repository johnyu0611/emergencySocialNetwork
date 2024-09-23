import { PostRequestSchema, PostResponseSchema } from "@/api/schema/Users.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { UserSchema } from "@/model/UserSchema.mjs";
import { HTTP_BAD_REQUEST, HTTP_FORBIDDEN } from "@/util/Constants.mjs";
import { parseError } from "@/util/ErrorParser.mjs";

const loggerContext = "UsernameAPIHandler";
const endpoint = "/username";

export function handleUsername({ router, passwordHasher }) {
  async function handleUsernamePost(req, res) {
    const loggerContext = "UsernamePOSTHandler";

    try {
      // TODO: Temporary use of `Users` schemas, since it is a temporary endpoint
      const payload = PostRequestSchema.parse(req.body);
      logger.debug({ context: loggerContext }, "Request received: %o", payload);

      const { username, password } = payload;
      const existingUser = await UserSchema.findOne({ username });

      let hashedPassword = await passwordHasher.hash("");
      if (existingUser) {
        hashedPassword = existingUser.password;
        if (await passwordHasher.verify(hashedPassword, password)) {
          // TODO: Continue to chat interface on Iteration 1
          throw new HTTPError(HTTP_BAD_REQUEST, "User exists");
        } else {
          throw new HTTPError(
            HTTP_FORBIDDEN,
            "User exists but incorrect password provided"
          );
        }
      }

      res.json({ message: "New user confirmed" });
    } catch (error) {
      const { reason, statusCode } = parseError(error);
      const errorResponseBody = PostResponseSchema.parse({
        reason: reason
      });
      res.status(statusCode);
      res.json(errorResponseBody);
      logger.warn(
        { context: loggerContext },
        "User failed to verify: %s",
        reason
      );
    } finally {
      res.end();
    }
  }

  router.post(endpoint, handleUsernamePost);
  logger.debug(
    { context: loggerContext },
    "POST handler registered for router endpoint %s",
    endpoint
  );
}
