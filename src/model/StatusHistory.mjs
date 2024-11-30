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

  async addStatusEntry({ userId, status, timestamp }) {
    return await new this.model({ userId, status, timestamp }).save();
  }

  async getStatusHistoryByUserId(userId) {
    return await this.model
      .find({ userId })
      .sort({ timestamp: -1 })
      .select("username status timestamp");
  }
}
