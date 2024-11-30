import { ApplicationSchema } from "@/database/schema/Application.mjs";
import { AbstractModel } from "@/model/Abstract.mjs";

export class ApplicationDataAccess extends AbstractModel {
  static #initializationSymbol = "%";
  static #instance = null;

  constructor(collectionName, schema, symbol) {
    if (symbol !== ApplicationDataAccess.#initializationSymbol) {
      throw new Error(
        "Cannot initialize a singleton ApplicationDataAccess class via constructor"
      );
    }
    super({ collectionName, schema });
    ApplicationDataAccess.#instance = this;
    return ApplicationDataAccess.#instance;
  }

  static getInstance() {
    if (!ApplicationDataAccess.#instance) {
      new ApplicationDataAccess(
        "applications",
        ApplicationSchema,
        ApplicationDataAccess.#initializationSymbol
      );
    }
    return ApplicationDataAccess.#instance;
  }

  async create(application) {
    return await new this.model(application).save();
  }

  async findAll() {
    return await this.model
      .find({})
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .select("-__v"); // Exclude versioning field, if not needed
  }

  async findByResourceName(resourceName) {
    return await this.model
      .find({ resourceName })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .select("-__v");
  }

  async findByUserId(resourceOwnerId) {
    return await this.model
      .find({ resourceOwnerId }) // Use `resourceOwner` for filtering
      .sort({ createdAt: -1 })
      .select("-__v");
  }

  async deleteById(id) {
    console.debug("Attempting to delete application with ID:", id);
    // If your schema uses `id` instead of `_id`:
    return await this.model.findOneAndDelete({ id });
  }
}
