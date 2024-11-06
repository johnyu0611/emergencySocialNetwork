import { StatusHistorySchema } from "@/database/schema/StatusHistory.mjs"; // Adjust the path as needed
import { AbstractModel } from "@/model/Abstract.mjs";

export class StatusHistoryDataAccess extends AbstractModel {
  static #initializationSymbol = "%";
  static #instance = null;

  constructor(collectionName, schema, symbol) {
    if (symbol !== StatusHistoryDataAccess.#initializationSymbol) {
      throw new Error(
        "Cannot initialize a singleton StatusHistoryDataAccess class via constructor"
      );
    }
    super({ collectionName, schema });
    StatusHistoryDataAccess.#instance = this;
    return StatusHistoryDataAccess.#instance;
  }

  static getInstance() {
    if (!StatusHistoryDataAccess.#instance) {
      new StatusHistoryDataAccess(
        "status_history",
        StatusHistorySchema,
        StatusHistoryDataAccess.#initializationSymbol
      );
    }
    return StatusHistoryDataAccess.#instance;
  }

  async addStatusEntry({ username, status, timestamp }) {
    return await new this.model({ username, status, timestamp }).save();
  }

  async getStatusHistoryByUsername(username) {
    return await this.model
      .find({ username })
      .sort({ timestamp: -1 })
      .select("username status timestamp");
  }
}
