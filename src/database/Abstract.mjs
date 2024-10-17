import { HTTPError } from "@/error/HTTPError.mjs";
import { HTTP_METHOD_NOT_ALLOWED } from "@/util/Constants.mjs";

export class AbstractDatabase {
  static #errorMessageMethodNotAllowed = "Abstract method not allowed";
  #dbType;

  constructor({ dbType = undefined }) {
    if (this.constructor === AbstractDatabase) {
      throw new Error("Cannot instantiate an abstract db");
    }

    this.#dbType = dbType;
  }

  get dbType() {
    return this.#dbType;
  }

  async connect() {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractDatabase.#errorMessageMethodNotAllowed
    );
  }

  async disconnect() {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractDatabase.#errorMessageMethodNotAllowed
    );
  }
}
