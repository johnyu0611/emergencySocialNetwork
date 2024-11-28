import { MedicalCenterSchema } from "@/database/schema/MedicalCenter.mjs";
import { AbstractModel } from "@/model/Abstract.mjs";

export class MedicalCenterDataAccess extends AbstractModel {
  static #initializationSymbol = "^";
  static #instance = null;

  constructor(collectionName, schema, symbol) {
    if (symbol !== MedicalCenterDataAccess.#initializationSymbol) {
      throw new Error(
        "Cannot initialize a singleton PrivateChatroomsDataAccess class via constructor"
      );
    }
    super({ collectionName, schema });
    MedicalCenterDataAccess.#instance = this;
    return MedicalCenterDataAccess.#instance;
  }

  static getInstance() {
    if (!MedicalCenterDataAccess.#instance) {
      new MedicalCenterDataAccess(
        "medicalcenters",
        MedicalCenterSchema,
        MedicalCenterDataAccess.#initializationSymbol
      );
    }
    return MedicalCenterDataAccess.#instance;
  }

  async create(data) {
    return await new this.model(data).save();
  }

  async findAll() {
    return await this.model.find({});
  }

  async findByUser({ author }) {
    return await this.model.find({
      author
    });
  }

  async findByAddress({ address }) {
    return await this.model.findOne({ address });
  }
  async deleteByMcId({ mcId }) {
    return await this.model.findOneAndDelete({ mcId });
  }

  async findByMCID({ mcId }) {
    return await this.model.findOne({ mcId });
  }

  async updateIntroductionByMCID({ mcId, introduction }) {
    return await this.model.updateOne({ mcId }, { $set: { introduction } });
  }
}
