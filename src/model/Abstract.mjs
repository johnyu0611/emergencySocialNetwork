import { HTTPError } from "@/error/HTTPError.mjs";
import { HTTP_METHOD_NOT_ALLOWED } from "@/util/Constants.mjs";
import { parseError } from "@/util/ErrorParser.mjs";
import mongoose from "mongoose";

export class AbstractModel {
    static #errorMessageMethodNotAllowed = "Abstract method not allowed";
    _model = null;

    constructor({ collectionName, schema}) {
        if (this.constructor === AbstractModel) {
            throw new Error("Cannot instantiate an abstract db");
        }
        this._model = mongoose.model(collectionName, schema);
    }

    get model() {
        return this._model;
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