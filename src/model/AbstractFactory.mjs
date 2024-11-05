import { HTTPError } from "@/error/HTTPError.mjs";
import { HTTP_METHOD_NOT_ALLOWED } from "@/util/Constants.mjs";

export class AbstractFactory {
  static #errorMessageMethodNotAllowed = "Abstract method not allowed";
  constructor() {
    if (this.constructor === AbstractFactory) {
      throw new Error(
        "Cannot instantiate abstract class AbstractMessageFactory directly."
      );
    }
  }

  static getModel() {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractFactory.#errorMessageMethodNotAllowed
    );
  }
}
