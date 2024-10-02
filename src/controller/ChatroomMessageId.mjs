import { AbstractController } from "@/controller/Abstract.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { HTTP_NOT_IMPLEMENTED } from "@/util/Constants.mjs";

export class ChatroomMessageIdController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== ChatroomMessageIdController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/:messageId"
  ) {
    if (!ChatroomMessageIdController.#instance) {
      ChatroomMessageIdController.#instance = new ChatroomMessageIdController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: ChatroomMessageIdController.#initializationSymbol
      });
    }
    return ChatroomMessageIdController.#instance;
  }

  async handleGet(req, res) {
    const loggerContext = "ChatroomMessageIDControllerGETHandler";
    throw new HTTPError(HTTP_NOT_IMPLEMENTED, "Not implemented");
  }

  async handlePost(req, res) {
    const loggerContext = "ChatroomMessageIDControllerPOSTHandler";
    throw new HTTPError(HTTP_NOT_IMPLEMENTED, "Not implemented");
  }
}
