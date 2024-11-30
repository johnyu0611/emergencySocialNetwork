import { AbstractController } from "@/controller/Abstract.mjs";
import { ZodError } from "zod";
import { PostResourceRequestSchema } from "@/controller/schema/PostResource.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { logger } from "@/log/Logger.mjs";
import { ResourceDataAccess } from "@/model/Resource.mjs";
import { v4 as uuidv4 } from "uuid";
import {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_BAD_REQUEST,
  HTTP_FORBIDDEN,
  HTTP_CREATED
} from "@/util/Constants.mjs";

export class ResourceController extends AbstractController {
  static #initializationSymbol = Symbol("");
  static #instance = null;
  #resourceDAO = null;

  constructor({ upstreamRouter, path, middlewareMap, context, symbol }) {
    if (symbol !== ResourceController.#initializationSymbol) {
      throw TypeError("Cannot initialize a singleton class via constructor");
    }
    super({ upstreamRouter, path, middlewareMap, context });
    this.#resourceDAO = ResourceDataAccess.getInstance();
  }

  setResourceDAO(ResourceDAO) {
    this.#resourceDAO = ResourceDAO;
  }

  static getInstance(
    upstreamRouter = undefined,
    context = {},
    middlewareMap = {},
    path = "/resources"
  ) {
    if (!ResourceController.#instance) {
      ResourceController.#instance = new ResourceController({
        upstreamRouter,
        path,
        middlewareMap,
        context,
        symbol: ResourceController.#initializationSymbol
      });
    }
    return ResourceController.#instance;
  }

  async handlePost(req, res) {
    const loggerContext = "ResourceControllerPOSTHandler";

    if (!req.auth || !req.auth.userId) {
      logger.error({ context: loggerContext }, "Unauthorized access attempt");
      throw new HTTPError(
        HTTP_FORBIDDEN,
        "User is not authorized to perform this action"
      );
    }

    const { userId } = req.auth;
    console.log(`getting username ${userId}`);
    // Retrieve the image data and type
    const imageBase64 = req.body.imageBase64 || undefined;
    const imageType = req.body.imageType || undefined;

    const compressedImageBase64 = imageBase64;

    if (imageBase64 && imageType) {
      try {
        // Process image with Sharp
      } catch (error) {
        logger.error(
          { context: loggerContext },
          "Error processing image: %o",
          error
        );
        throw new HTTPError(HTTP_BAD_REQUEST, "Failed to process image");
      }
    }

    // Create the payload with the compressed image data and generate a unique resource ID
    const payload = {
      id: uuidv4(),
      name: req.body.name,
      amount: parseInt(req.body.amount, 10),
      description: req.body.description,
      imageBase64: compressedImageBase64,
      imageType: imageType,
      userId: userId,
      resourceType: req.body.resourceType,
      createdAt: new Date(new Date().setHours(0, 0, 0, 0))
    };

    try {
      // Validate the payload
      const validatedPayload = PostResourceRequestSchema.parse(payload);

      const savedResource = await this.#resourceDAO.create(validatedPayload);
      res.status(HTTP_CREATED).json({
        id: savedResource.id,
        timestamp: savedResource.createdAt.toISOString() // Convert Date to string
      });

      logger.info(
        { context: loggerContext },
        `Resource ${validatedPayload.name} created by ${userId}`
      );
    } catch (error) {
      if (error instanceof ZodError) {
        throw new HTTPError(HTTP_BAD_REQUEST, "Validation failed");
      }
      logger.error(
        { context: loggerContext },
        "Error saving resource: %o",
        error
      );
      throw new HTTPError(HTTP_BAD_REQUEST, "Failed to save resource");
    }
  }

  async handleGet(req, res) {
    const loggerContext = "ResourceControllerGETHandler";

    try {
      const { searchBy } = req.body || {};
      const resourceId = searchBy?.resourceId;

      let resources = undefined;

      if (resourceId) {
        // Fetch a single resource by ID
        const resource = await this.#resourceDAO.findOne({ id: resourceId });
        if (!resource) {
          throw new HTTPError(
            HTTP_NOT_FOUND,
            `Resource with ID ${resourceId} not found`
          );
        }
        resources = [resource.toObject()]; // Convert to plain object
      } else {
        // Fetch all resources
        const resourceDocs = await this.#resourceDAO.findAll();
        resources = resourceDocs.map((doc) => doc.toObject()); // Convert each to plain object
      }

      const resourcesWithImages = resources.map((resource) => ({
        ...resource,
        imageBase64: resource.imageBase64 || null,
        imageType: resource.imageType || null
      }));

      res.status(HTTP_OK).json({
        resources: resourcesWithImages,
        total: resourcesWithImages.length
      });
      logger.info(
        { context: loggerContext },
        "Returned resources list with images"
      );
    } catch (error) {
      logger.error(
        { context: loggerContext },
        "Error retrieving resources: %o",
        error
      );
      throw new HTTPError(HTTP_BAD_REQUEST, "Failed to retrieve resources");
    }
  }

  async handlePatch(req, res) {
    const loggerContext = "ResourceControllerPATCHHandler";

    if (!req.auth) {
      logger.error({ context: loggerContext }, "Unauthorized access attempt");
      throw new HTTPError(
        HTTP_FORBIDDEN,
        "User is not authorized to modify resources"
      );
    }

    const { id, amount } = req.body; // Extract id and amount from the body

    // Validate input
    if (!id) {
      throw new HTTPError(HTTP_BAD_REQUEST, "Resource ID is required");
    }

    if (amount === undefined || amount < 0) {
      throw new HTTPError(HTTP_BAD_REQUEST, "Invalid amount");
    }

    try {
      // Use findOne to query the `id` field
      const resource = await this.#resourceDAO.findOne({ id });

      if (!resource) {
        throw new HTTPError(HTTP_NOT_FOUND, `Resource with ID ${id} not found`);
      }

      resource.amount = amount; // Update the amount
      await resource.save(); // Save the updated resource

      res
        .status(HTTP_OK)
        .json({ message: "Resource amount updated successfully" });
      logger.info(
        { context: loggerContext },
        `Resource ${id} updated by ${req.auth.username}`
      );
    } catch (error) {
      logger.error(
        { context: loggerContext, error: error.stack || error.message },
        "Error updating resource"
      );
      throw new HTTPError(HTTP_BAD_REQUEST, "Failed to update resource");
    }
  }

  async handleDelete(req, res) {
    const loggerContext = "ResourceControllerDELETEHandler";

    if (!req.auth || !req.auth.userId) {
      logger.error({ context: loggerContext }, "Unauthorized access attempt");
      throw new HTTPError(
        HTTP_FORBIDDEN,
        "User is not authorized to delete resources"
      );
    }

    const { id } = req.body; // Extract `id` from the request body

    if (!id) {
      throw new HTTPError(HTTP_BAD_REQUEST, "Resource ID is required");
    }

    try {
      // Use findOneAndDelete to query and delete by the `id` field
      const resource = await this.#resourceDAO.findOneAndDelete({ id });

      if (!resource) {
        throw new HTTPError(HTTP_NOT_FOUND, `Resource with ID ${id} not found`);
      }

      res.status(HTTP_OK).json({ message: "Resource deleted successfully" });
      logger.info(
        { context: loggerContext },
        `Resource ${id} deleted by ${req.auth.username}`
      );
    } catch (error) {
      logger.error(
        { context: loggerContext, error: error.stack || error.message },
        "Error deleting resource"
      );
      throw new HTTPError(HTTP_BAD_REQUEST, "Failed to delete resource");
    }
  }
}
