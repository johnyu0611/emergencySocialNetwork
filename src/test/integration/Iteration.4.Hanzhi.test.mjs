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
  let req = undefined;
  let res = undefined;
  let server = undefined;

  beforeAll(async () => {
    config.environment.databaseUser = "hanzhi";
    config.environment.databasePassword = "hanzhi";
    config.environment.databaseCluster = "fse.qw9qk.mongodb.net";
    config.environment.databaseName = "IntegrationTestResource";
    config.environment.databaseAppName = "FSE";
    config.environment.jwtPreSharedKey = "FSE-SB1";

    config.environment.port = 3002;
    server = await runServer();
    resourceController = ResourceController.getInstance();
  });

  beforeEach(async () => {
    // Mock authenticated user
    req = {
      auth: { username: "testuser" },
      body: {
        name: "Resource1",
        amount: 10,
        resourceType: "provide"
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await resourceController.handlePost(req, res);
  });

  afterEach(async () => {
    await MongoDBConnection.clearDB();
  });

  afterAll(async () => {
    await MongoDBConnection.closeConnection();
    await server.close();
  });

  test("should create a new resource", async () => {
    req = {
      auth: { username: "testuser" },
      body: {
        name: "Resource2",
        amount: 5,
        resourceType: "request",
        description: "Need this resource"
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await resourceController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_CREATED);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        timestamp: expect.any(String) // Expect a string instead of a Date object
      })
    );
  });

  test("should get all resources", async () => {
    req = {
      auth: { username: "testuser" },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await resourceController.handleGet(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        resources: expect.arrayContaining([
          expect.objectContaining({
            name: "Resource1",
            amount: 10,
            resourceType: "provide",
            username: "testuser"
          })
        ])
      })
    );
  });

  test("should update a resource amount", async () => {
    // First, retrieve the resource to get its ID
    req = {
      auth: { username: "testuser" },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await resourceController.handleGet(req, res);
    const resourceId = res.json.mock.calls[0][0].resources[0].id;

    // Now, update the resource amount
    req = {
      auth: { username: "testuser" },
      body: {
        id: resourceId,
        amount: 15
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await resourceController.handlePatch(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Resource amount updated successfully"
      })
    );
  });

  test("should delete a resource", async () => {
    // First, retrieve the resource to get its ID
    req = {
      auth: { username: "testuser" },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await resourceController.handleGet(req, res);
    const resourceId = res.json.mock.calls[0][0].resources[0].id;

    // Now, delete the resource
    req = {
      auth: { username: "testuser" },
      body: {
        id: resourceId
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await resourceController.handleDelete(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Resource deleted successfully"
      })
    );
  });

  test("should not allow unauthorized access", async () => {
    req = {
      auth: null, // No authentication
      body: {
        name: "Resource3",
        amount: 5,
        resourceType: "provide"
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await expect(resourceController.handlePost(req, res)).rejects.toThrow(
      "User is not authorized to perform this action"
    );
  });

  test("should not create a resource with missing required fields", async () => {
    req = {
      auth: { username: "testuser" },
      body: {
        // Missing 'name' and 'resourceType'
        amount: 5
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await expect(resourceController.handlePost(req, res)).rejects.toThrow(
      "Validation failed"
    );

    expect(res.status).not.toHaveBeenCalledWith(HTTP_CREATED);
    expect(res.json).not.toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        timestamp: expect.any(String)
      })
    );
  });
});
