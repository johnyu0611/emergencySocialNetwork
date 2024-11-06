import { UserSchema } from "@/database/schema/User.mjs";
import { AbstractModel } from "@/model/Abstract.mjs";

export class UserDataAccess extends AbstractModel {
  static #initializationSymbol = "%";
  static #instance = null;

  constructor(collectionName, schema, symbol) {
    if (symbol !== UserDataAccess.#initializationSymbol) {
      throw new Error(
        "Cannot initialize a singleton UserDataAccess class via constructor"
      );
    }
    super({ collectionName, schema });
    UserDataAccess.#instance = this;
    return UserDataAccess.#instance;
  }

  static getInstance() {
    if (!UserDataAccess.#instance) {
      new UserDataAccess(
        "users",
        UserSchema,
        UserDataAccess.#initializationSymbol
      );
    }
    return UserDataAccess.#instance;
  }

  async create(user) {
    return await new this.model(user).save();
  }

  async findAll() {
    return await this.model
      .find({})
      .sort({ isOnline: -1, username: 1 })
      .select("username isOnline status");
  }

  async findByUsername({ username }) {
    return await this.model.findOne({ username });
  }

  async findByChatroomId({ chatroomId }) {
    return await this.model.findOne({ "chatrooms.id": chatroomId });
  }

  async find(query) {
    return await this.model.find(query);
  }

  async update({ username }, updateFields) {
    return await this.model.findOneAndUpdate({ username }, updateFields);
  }
}
