import { MessageSchema } from "@/database/schema/Message.mjs";
import mongoose from "mongoose";
import { AbstractModel } from "@/model/Abstract.mjs";

export class MessageDataAccess extends AbstractModel {
  static #initializationSymbol = '~';
  static #instance = null;

  constructor(collectionName, schema, symbol) {
    if (symbol !== MessageDataAccess.#initializationSymbol) {
      throw new Error("Cannot initialize a singleton MessageDataAccess class via constructor");
    }
    super({ collectionName, schema });
    MessageDataAccess.#instance = this;
    return MessageDataAccess.#instance;
  }

  static getInstance() {
    if (!MessageDataAccess.#instance) {
      new MessageDataAccess('messages', MessageSchema, MessageDataAccess.#initializationSymbol);
    }
    return MessageDataAccess.#instance;
  }

  async findAll() {
    return await this.model.find().sort({ timestamp: 1 });
  }

  async create(msg) {
    return await new this.model(msg).save();
  }
}
