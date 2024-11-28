import { ReviewSchema } from "@/database/schema/Review.mjs";
import { AbstractModel } from "@/model/Abstract.mjs";

export class ReviewDataAccess extends AbstractModel {
  static #initializationSymbol = "^";
  static #instance = null;

  constructor(collectionName, schema, symbol) {
    if (symbol !== ReviewDataAccess.#initializationSymbol) {
      throw new Error(
        "Cannot initialize a singleton PrivateChatroomsDataAccess class via constructor"
      );
    }
    super({ collectionName, schema });
    ReviewDataAccess.#instance = this;
    return ReviewDataAccess.#instance;
  }

  static getInstance() {
    if (!ReviewDataAccess.#instance) {
      new ReviewDataAccess(
        "reviews",
        ReviewSchema,
        ReviewDataAccess.#initializationSymbol
      );
    }
    return ReviewDataAccess.#instance;
  }

  async create(data) {
    return await new this.model(data).save();
  }

  async findAll() {
    return await this.model.find({});
  }

  async findByMCID({ mcId }) {
    return await this.model
      .find({
        mcId
      })
      .sort({ timestamp: -1 });
  }
}
