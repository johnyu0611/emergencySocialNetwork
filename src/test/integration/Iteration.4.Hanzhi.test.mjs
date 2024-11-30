import express from "express";
import { ResourceController } from "@/controller/PostResource.mjs";
import {
  test,
  expect,
  jest,
  describe,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll
} from "@jest/globals";
import { HTTP_CREATED, HTTP_OK } from "@/util/Constants.mjs";
import { MongoDBConnection } from "@/database/Connections.mjs";
import { runServer } from "@/Server.mjs";
import { config } from "@/config/Config.mjs";

describe("Integration test for ResourceController", () => {
  let resourceController = undefined;
  let server = undefined;

  beforeAll(async () => {
    config.environment.databaseUser = "hanzhi";
    config.environment.databasePassword = "hanzhi";
    config.environment.databaseCluster = "fse.qw9qk.mongodb.net";
    config.environment.databaseName = "IntegrationTestResource";
    config.environment.databaseAppName = "FSE";
    config.environment.jwtPreSharedKey = "FSE-SB1";
    config.environment.port = 3400;

    const router = express.Router();
    resourceController = ResourceController.getInstance(
      router,
      {},
      {},
      "/resources"
    );

    if (!resourceController) {
      throw new Error("Failed to initialize ResourceController");
    }

    server = await runServer();
  });

  beforeEach(async () => {
    const req = {
      auth: { userId: 12345 }, // Valid number as per schema
      body: {
        id: "123e4567-e89b-12d3-a456-426614174000", // Valid UUID
        name: "Resource1",
        amount: 10,
        resourceType: "provide",
        description: "Test resource",
        createdAt: new Date() // Valid Date object
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await resourceController.handlePost(req, res);
  });

  afterEach(async () => {
    await MongoDBConnection.clearDB(); // Clear the database after each test
  });

  afterAll(async () => {
    await MongoDBConnection.closeConnection();
    if (server && server.close) {
      await server.close();
    }
  });

  test("should create a new resource", async () => {
    const req = {
      auth: { userId: 12345 }, // Valid number
      body: {
        id: "223e4567-e89b-12d3-a456-426614174001", // Valid UUID
        name: "Resource2",
        amount: 5,
        resourceType: "request",
        description: "Need this resource",
        createdAt: new Date() // Valid Date object
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await resourceController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_CREATED);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        timestamp: expect.any(String)
      })
    );
  });

  test("should get all resources", async () => {
    const req = {
      auth: { userId: 12345 }, // Valid number
      body: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await resourceController.handleGet(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        resources: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: "Resource1",
            amount: 10,
            resourceType: "provide",
            description: "Test resource",
            userId: 12345 // Ensure correct userId is included
          })
        ])
      })
    );
  });

  test("should update a resource amount", async () => {
    const reqGet = {
      auth: { userId: 12345 }, // Valid number
      body: {}
    };
    const resGet = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Fetch the created resource to get its ID
    await resourceController.handleGet(reqGet, resGet);
    const resourceId = resGet.json.mock.calls[0][0].resources[0].id;

    const reqUpdate = {
      auth: { userId: 12345 },
      body: {
        id: resourceId,
        amount: 15
      }
    };
    const resUpdate = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await resourceController.handlePatch(reqUpdate, resUpdate);

    expect(resUpdate.status).toHaveBeenCalledWith(HTTP_OK);
    expect(resUpdate.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Resource amount updated successfully"
      })
    );
  });

  test("should delete a resource", async () => {
    const reqGet = {
      auth: { userId: 12345 }, // Valid number
      body: {}
    };
    const resGet = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Fetch the created resource to get its ID
    await resourceController.handleGet(reqGet, resGet);
    const resourceId = resGet.json.mock.calls[0][0].resources[0].id;

    const reqDelete = {
      auth: { userId: 12345 }, // Valid number
      body: {
        id: resourceId
      }
    };
    const resDelete = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await resourceController.handleDelete(reqDelete, resDelete);

    expect(resDelete.status).toHaveBeenCalledWith(HTTP_OK);
    expect(resDelete.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Resource deleted successfully"
      })
    );
  });

  test("should not allow unauthorized access", async () => {
    const req = {
      auth: null, // No authentication
      body: {
        id: "323e4567-e89b-12d3-a456-426614174002", // Valid UUID
        name: "Resource3",
        amount: 5,
        resourceType: "provide",
        createdAt: new Date()
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await expect(resourceController.handlePost(req, res)).rejects.toThrow(
      "User is not authorized to perform this action"
    );
  });

  test("should return the correct total count of resources", async () => {
    const req = {
      auth: { userId: 12345 }, // Valid userId
      body: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Fetch all resources
    await resourceController.handleGet(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        total: expect.any(Number) // Ensure total is a number
      })
    );

    // Verify the total matches the number of resources created in `beforeEach`
    expect(res.json.mock.calls[0][0].total).toBe(1);
  });
});
