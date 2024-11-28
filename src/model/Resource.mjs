import { ResourceSchema } from "@/database/schema/Resource.mjs";
import { AbstractModel } from "@/model/Abstract.mjs";

export class ResourceDataAccess extends AbstractModel {
  static #initializationSymbol = "%";
  static #instance = null;

  constructor(collectionName, schema, symbol) {
    if (symbol !== ResourceDataAccess.#initializationSymbol) {
      throw new Error(
        "Cannot initialize a singleton ResourceDataAccess class via constructor"
      );
    }
    super({ collectionName, schema });
    ResourceDataAccess.#instance = this;
    return ResourceDataAccess.#instance;
  }

  static getInstance() {
    if (!ResourceDataAccess.#instance) {
      new ResourceDataAccess(
        "resources",
        ResourceSchema,
        ResourceDataAccess.#initializationSymbol
      );
    }
    return ResourceDataAccess.#instance;
  }

  async create(resource) {
    return await new this.model(resource).save();
  }

  async findOne(query) {
    return await this.model.findOne(query).select("-__v"); // Exclude versioning field
  }

  async findOneAndDelete(query) {
    return await this.model.findOneAndDelete(query).select("-__v"); // Query by `id` field and exclude versioning field
  }

  async findAll() {
    return await this.model
      .find({})
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .select("-__v"); // Exclude versioning field, if not needed
  }
}
