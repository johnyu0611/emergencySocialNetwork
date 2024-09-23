import { HTTP_BAD_REQUEST, HTTP_INTERNAL_SERVER_ERROR } from "./Constants.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { ZodError } from "zod";

export function parseError(error) {
  logger.error({ context: "ErrorHandler" }, error.message);

  let statusCode = HTTP_INTERNAL_SERVER_ERROR;
  let reason = "Unknown error occurred";

  if (error instanceof HTTPError) {
    statusCode = error.status;
    reason = error.message;
  } else if (error instanceof ZodError) {
    statusCode = HTTP_BAD_REQUEST;
    reason = error.message;
  } else if (error instanceof Error) {
    reason = error.message;
  }

  return { reason: reason, statusCode: statusCode };
}
