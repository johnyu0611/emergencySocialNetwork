import { HTTPError } from "@/error/HTTPError.mjs";
import { HTTP_METHOD_NOT_ALLOWED } from "@/util/Constants.mjs";
import mongoose from "mongoose";

export class AbstractModel {
  static #errorMessageMethodNotAllowed = "Abstract method not allowed";
  #model = null;

  constructor({ collectionName, schema }) {
    if (this.constructor === AbstractModel) {
      throw new Error("Cannot instantiate an abstract db");
    }
    this.#model = mongoose.model(collectionName, schema);
  }

  get model() {
    return this.#model;
  }

  async findOne() {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractModel.#errorMessageMethodNotAllowed
    );
  }

  async findAll() {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractModel.#errorMessageMethodNotAllowed
    );
  }

  async findByUsername() {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractModel.#errorMessageMethodNotAllowed
    );
  }

  async create() {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractModel.#errorMessageMethodNotAllowed
    );
  }

  async delete() {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractModel.#errorMessageMethodNotAllowed
    );
  }

  async update() {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractModel.#errorMessageMethodNotAllowed
    );
  }
}
