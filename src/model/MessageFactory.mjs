import { MessageDataAccess } from "@/model/Message.mjs";

export class MessageFactory {
  static modelCache = {};

  static getModel(uuid) {
    if (!MessageFactory.modelCache[uuid]) {
      MessageFactory.modelCache[uuid] = new MessageDataAccess(uuid);
    }

    return MessageFactory.modelCache[uuid];
  }
}
