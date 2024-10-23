import { MessageSchema } from "@/database/schema/Message.mjs";
import mongoose from "mongoose";

export class MessageDataAccess {
  // static #initializationSymbol = '~';
  // static #instance = null;

  // constructor(collectionName, schema, symbol) {
  //   if (symbol !== MessageDataAccess.#initializationSymbol) {
  //     throw new Error("Cannot initialize a singleton MessageDataAccess class via constructor");
  //   }
  //   super({ collectionName, schema });
  //   MessageDataAccess.#instance = this;
  //   return MessageDataAccess.#instance;
  // }

  // static getInstance(collectionName) {
  //   if (!MessageDataAccess.#instance) {
  //     new MessageDataAccess('messages', MessageSchema, MessageDataAccess.#initializationSymbol);
  //   }
  // }

  constructor(collectionName) {
    this.model = mongoose.model(collectionName, MessageSchema);
  }

  async findOne(filter) {
    return await this.model.findOne(filter);
  }

  async findAll() {
    return await this.model.find().sort({ timestamp: 1 });
  }

  async create(msg) {
    return await new this.model(msg).save();
  }

  async update({ _id }, updateFields) {
    return await this.model.findOneAndUpdate({ _id }, updateFields);
  }
}
