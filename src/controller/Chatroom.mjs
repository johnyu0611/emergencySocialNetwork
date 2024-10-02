import { AbstractController } from "@/controller/Abstract.mjs";
import {
  GetRequestSchema,
  GetResponseSchema
} from "@/controller/schema/Chatroom.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { HTTP_NOT_IMPLEMENTED } from "@/util/Constants.mjs";

export class ChatroomController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== ChatroomController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/chatrooms"
  ) {
    if (!ChatroomController.#instance) {
      ChatroomController.#instance = new ChatroomController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: ChatroomController.#initializationSymbol
      });
    }
    return ChatroomController.#instance;
  }

  async handleGet(req, res) {
    const loggerContext = "ChatroomControllerGETHandler";
    const { username } = req.auth;

    const payload = GetRequestSchema.parse(req.body);
    logger.debug({ context: loggerContext }, "Request received: %o", payload);

    // TODO: Now only have one chatroom (public chatroom)
    const responseBody = GetResponseSchema.parse({
      chatrooms: [
        {
          id: "00000000-0000-0000-0000-000000000000",
          title: "Public Chatroom"
        }
      ]
    });
    res.json(responseBody);
  }

  async handlePost(req, res) {
    // TODO: Possible in Iteration 4
    const loggerContext = "ChatroomControllerPOSTHandler";
    throw new HTTPError(HTTP_NOT_IMPLEMENTED, "Not implemented");
  }
}
