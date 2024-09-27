import { HTTPError } from "@/error/HTTPError.mjs";
import { HTTP_METHOD_NOT_ALLOWED } from "@/util/Constants.mjs";
import { parseError } from "@/util/ErrorParser.mjs";
import { json, Router } from "express";

export class AbstractController {
  static #errorMessageMethodNotAllowed = "Method not allowed";
  #router;
  #path;
  #context;

  constructor({ upstreamRouter, path, context }) {
    if (this.constructor === AbstractController) {
      throw new Error("Cannot instantiate an abstract class");
    }

    this.#router = Router();
    this.#path = path;
    this.#context = context;
    upstreamRouter.use(this.#router);

    this.#router.get(this.#path, (req, res) =>
      this.#handleError(this.handleGet, req, res)
    );
    this.#router.post(this.#path, (req, res) =>
      this.#handleError(this.handlePost, req, res)
    );
    this.#router.put(this.#path, (req, res) =>
      this.#handleError(this.handlePut, req, res)
    );
    this.#router.delete(this.#path, (req, res) =>
      this.#handleError(this.handleDelete, req, res)
    );
    this.#router.patch(this.#path, (req, res) =>
      this.#handleError(this.handlePatch, req, res)
    );
  }

  get router() {
    return this.#router;
  }

  get path() {
    return this.#path;
  }

  get context() {
    return this.#context;
  }

  async handleGet(req, res) {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractController.#errorMessageMethodNotAllowed
    );
  }

  async handlePost(req, res) {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractController.#errorMessageMethodNotAllowed
    );
  }

  async handlePut(req, res) {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractController.#errorMessageMethodNotAllowed
    );
  }

  async handleDelete(req, res) {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractController.#errorMessageMethodNotAllowed
    );
  }

  async handlePatch(req, res) {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractController.#errorMessageMethodNotAllowed
    );
  }

  async #handleError(requestHandler, req, res) {
    try {
      return await requestHandler.call(this, req, res);
    } catch (error) {
      const { reason, statusCode } = parseError(error);
      res.status(statusCode);
      res.json({ reason: reason });
    } finally {
      res.end();
    }
  }
}
