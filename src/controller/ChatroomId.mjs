import { AbstractController } from "@/controller/Abstract.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { HTTP_NOT_IMPLEMENTED } from "@/util/Constants.mjs";

export class ChatroomIdController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== ChatroomIdController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/:chatroomId"
  ) {
    if (!ChatroomIdController.#instance) {
      ChatroomIdController.#instance = new ChatroomIdController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: ChatroomIdController.#initializationSymbol
      });
    }
    return ChatroomIdController.#instance;
  }

  async handleGet(req, res) {
    const loggerContext = "ChatroomIDControllerGETHandler";
    throw new HTTPError(HTTP_NOT_IMPLEMENTED, "Not implemented");
  }
}
