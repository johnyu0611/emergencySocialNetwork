import { MessageDataAccess } from "@/model/Message.mjs";
import { AbstractFactory } from "@/model/AbstractFactory.mjs";

export class MessageFactory extends AbstractFactory {
  static modelCache = {};
  static #instance = null;

  constructor() {
    super();
    if (MessageFactory.#instance) {
      return MessageFactory.#instance;
    }

    MessageFactory.#instance = this;
  }

  static getModel(uuid) {
    if (!MessageFactory.modelCache[uuid]) {
      MessageFactory.modelCache[uuid] = new MessageDataAccess(uuid);
    }

    return MessageFactory.modelCache[uuid];
  }
}
