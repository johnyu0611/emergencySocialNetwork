import { MessageModel } from "@/model/Message.mjs";

class MessageDataAccess {
  static instance = null;

  constructor() {
    if (MessageDataAccess.instance) {
      return MessageDataAccess.instance;
    }

    MessageDataAccess.instance = this;
    return MessageDataAccess.instance;
  }
  async getAllMessage() {
    return await MessageModel.find().sort({ timestamp: 1 });
  }

  async saveMessage(msg) {
    return await new MessageModel(msg).save();
  }
}

export const messageDAO = new MessageDataAccess();
