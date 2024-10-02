import { HTTPError } from "@/error/HTTPError.mjs";
import { HTTP_METHOD_NOT_ALLOWED } from "@/util/Constants.mjs";
import { parseError } from "@/util/ErrorParser.mjs";
import { Router } from "express";

export class AbstractController {
  static #errorMessageMethodNotAllowed = "Method not allowed";
  #router;
  #path;
  #context;

  constructor({ upstreamRouter, path, middlewareMap, context }) {
    if (this.constructor === AbstractController) {
      throw new Error("Cannot instantiate an abstract class");
    }

    this.#router = Router({ mergeParams: true });
    this.#path = path;
    this.#context = context;
    upstreamRouter.use(path, this.#router);

    // Spread an undefined will lead to TypeError, so fill with an empty array
    // if the value doesn't exist
    for (const key of ["all", "get", "post", "put", "delete", "patch"]) {
      if (middlewareMap[key] == null) {
        middlewareMap[key] = [];
      }
    }

    this.#router.get(
      "/",
      ...middlewareMap.all,
      ...middlewareMap.get,
      (req, res) => this.#handleError(this.handleGet, req, res)
    );
    this.#router.post(
      "/",
      ...middlewareMap.all,
      ...middlewareMap.post,
      (req, res) => this.#handleError(this.handlePost, req, res)
    );
    this.#router.put(
      "/",
      ...middlewareMap.all,
      ...middlewareMap.put,
      (req, res) => this.#handleError(this.handlePut, req, res)
    );
    this.#router.delete(
      "/",
      ...middlewareMap.all,
      ...middlewareMap.delete,
      (req, res) => this.#handleError(this.handleDelete, req, res)
    );
    this.#router.patch(
      "/",
      ...middlewareMap.all,
      ...middlewareMap.patch,
      (req, res) => this.#handleError(this.handlePatch, req, res)
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

  async handleGet() {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractController.#errorMessageMethodNotAllowed
    );
  }

  async handlePost() {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractController.#errorMessageMethodNotAllowed
    );
  }

  async handlePut() {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractController.#errorMessageMethodNotAllowed
    );
  }

  async handleDelete() {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractController.#errorMessageMethodNotAllowed
    );
  }

  async handlePatch() {
    throw new HTTPError(
      HTTP_METHOD_NOT_ALLOWED,
      AbstractController.#errorMessageMethodNotAllowed
    );
  }

  async #handleError(requestHandler, req, res) {
    try {
      await requestHandler.call(this, req, res);
    } catch (error) {
      const { reason, statusCode } = parseError(error);
      res.status(statusCode);
      res.json({ reason });
    } finally {
      res.end();
    }
  }
}
