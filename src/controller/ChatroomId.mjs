import { AbstractController } from "@/controller/Abstract.mjs";

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

  // async handleGet(req, res) {
  // 	const loggerContext = "ChatroomIdControllerGETHandler";
  // 	const { username } = req.auth;
  // 	const { chatroomId } = req.params;
  // 	const messageModel = MessageFactory.getModel(chatroomId);

  // 	const payload = GetRequestSchema.parse(req.body);
  // 	logger.debug({ context: loggerContext }, "Request received: %o", payload);

  // 	const messages = await messageModel.findAll();
  // 	const responseBody = GetResponseSchema.parse({
  // 		messages
  // 	});
  // 	res.json(responseBody);
  // }
}
