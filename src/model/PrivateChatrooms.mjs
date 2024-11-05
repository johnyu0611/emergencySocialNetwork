import { PrivateChatroomsSchema } from "@/database/schema/PrivateChatrooms.mjs";
import { AbstractModel } from "@/model/Abstract.mjs";

export class PrivateChatroomsDataAccess extends AbstractModel {
  static #initializationSymbol = "^";
  static #instance = null;

  constructor(collectionName, schema, symbol) {
    if (symbol !== PrivateChatroomsDataAccess.#initializationSymbol) {
      throw new Error(
        "Cannot initialize a singleton PrivateChatroomsDataAccess class via constructor"
      );
    }
    super({ collectionName, schema });
    PrivateChatroomsDataAccess.#instance = this;
    return PrivateChatroomsDataAccess.#instance;
  }

  static getInstance() {
    if (!PrivateChatroomsDataAccess.#instance) {
      new PrivateChatroomsDataAccess(
        "privatechatrooms",
        PrivateChatroomsSchema,
        PrivateChatroomsDataAccess.#initializationSymbol
      );
    }
    return PrivateChatroomsDataAccess.#instance;
  }

  async create(data) {
    return await new this.model(data).save();
  }

  async findAll() {
    return await this.model.find({}).sort({ username: 1 });
  }

  async findByUser({ username, receiver }) {
    return await this.model.findOne({
      participants: { $all: [username, receiver] }
    });
  }
}
