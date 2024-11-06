import { MessageSchema } from "@/database/schema/Message.mjs";
import mongoose from "mongoose";

export class MessageDataAccess {
  constructor(collectionName) {
    this.model = mongoose.model(collectionName, MessageSchema);
  }

  async findOne(filter) {
    return await this.model.findOne(filter);
  }

  async find(query) {
    return await this.model.find(query);
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
