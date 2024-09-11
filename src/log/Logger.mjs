import pino from "pino";
import pinoPretty from "pino-pretty";
import { config } from "@/config/Config.mjs";

function messageFormatter(log, messageKey) {
  const messageComponents = [];

  if (log.context) {
    messageComponents.push(`[${log.context}]`);
  }

  messageComponents.push(log[messageKey]);
  return messageComponents.join(" ");
}

export const logger = pino(
  pinoPretty({
    colorize: true,
    colorizeObjects: true,
    messageFormat: messageFormatter,
    translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l o",
    hideObject: true
  })
);

export function initializeLogger(logger) {
  if (config.environment.development === "true" || config.commandLine.verbose) {
    logger.level = "debug";
  } else {
    logger.level = "info";
  }
}
