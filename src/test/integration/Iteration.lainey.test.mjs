import { UserController } from "@/controller/User.mjs";
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
import { HTTP_OK, HTTP_BAD_REQUEST } from "@/util/Constants.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { MongoDBConnection } from "@/database/Connections.mjs";
import { runServer } from "@/Server.mjs";
import { config } from "@/config/Config.mjs";
import { EmergencyContactController } from "@/controller/EmergencyContact.mjs";
import { EmergencyHistoryController } from "@/controller/EmergencyHistory.mjs";

describe("Integration test for EmergencyHistoryController and EmergencyContactController", () => {
  let userController = undefined;
  let req = undefined;
  let res = undefined;
  let server = undefined;
  let emergencyContactController = undefined;
  let emergencyHistoryController = undefined;

  beforeAll(async () => {
    config.environment.databaseUser = "hanzhi";
    config.environment.databasePassword = "hanzhi";
    config.environment.databaseCluster = "fse.qw9qk.mongodb.net";
    config.environment.databaseName = "IntegrationTestLainey";
    config.environment.databaseAppName = "FSE";
    config.environment.jwtPreSharedKey = "FSE-SB1";

    config.environment.port = 3002;
    server = await runServer();
    userController = UserController.getInstance();
    emergencyContactController = EmergencyContactController.getInstance();
    emergencyHistoryController = EmergencyHistoryController.getInstance();
  });

  beforeEach(async () => {
    req = {
      body: {
        username: "user303",
        password: "password3",
        isOnline: true,
        status: "OK",
        chatrooms: []
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await userController.handlePost(req, res);

    req = {
      body: {
        username: "user404",
        password: "password4",
        isOnline: true,
        status: "Help",
        chatrooms: []
      }
    };
    await userController.handlePost(req, res);
  });

  afterEach(async () => {
    await MongoDBConnection.clearDB();
  });

  afterAll(async () => {
    await MongoDBConnection.closeConnection();
    await server.close();
  });

  test("User303 set User404 as emergency contact successfully", async () => {
    req = {
      auth: { username: "user303" },
      body: {
        emergencyContact: {
          username: "user404",
          fullName: "User 404",
          email: "user404@example.com"
        }
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await emergencyContactController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({ emergencyContact: "user404" });
  });

  test("User303 retrieve User404 as emergency contact successfully", async () => {
    req = {
      auth: { username: "user303" },
      body: {
        emergencyContact: {
          username: "user404",
          fullName: "User 404",
          email: "user404@example.com"
        }
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await emergencyContactController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({ emergencyContact: "user404" });

    // Verify that user303's emergencyContact is updated
    req = {
      auth: { username: "user303" },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await emergencyContactController.handleGet(req, res);
    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({
      curr: "user303",
      username: "user404",
      fullName: "User 404",
      email: "user404@example.com",
      isOnline: true
    });

    req = {
      auth: { username: "user404" },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test("User303 posts emergency history, entry is added to emergencyContactTo's emergencyHistory", async () => {
    // Set emergency contact first
    req = {
      auth: { username: "user303" },
      body: {
        emergencyContact: {
          username: "user404",
          fullName: "User 404",
          email: "user404@example.com"
        }
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await emergencyContactController.handlePost(req, res);

    // Post emergency history
    req = {
      auth: { username: "user404" },
      body: {
        sender: "user404",
        content: "Emergency at location X"
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await emergencyHistoryController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({
      sender: "user404",
      content: "Emergency at location X"
    });

    // Now, have user404 retrieve their emergency history to verify the entry was added
    req = {
      auth: { username: "user303" },
      body: {
        who: "self"
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await emergencyHistoryController.handleGet(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json.mock.calls[0][0].history.length).toBe(1);
    expect(res.json.mock.calls[0][0].history[0]).toMatchObject({
      sender: "user404",
      content: "Emergency at location X",
      timestamp: expect.any(Date)
    });
  });

  test("User303 posts emergency history and user404 retrieve it", async () => {
    // Set emergency contact first
    req = {
      auth: { username: "user303" },
      body: {
        emergencyContact: {
          username: "user404",
          fullName: "User 404",
          email: "user404@example.com"
        }
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await emergencyContactController.handlePost(req, res);

    // Post emergency history
    req = {
      auth: { username: "user404" },
      body: {
        sender: "user404",
        content: "Emergency at location X"
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await emergencyHistoryController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({
      sender: "user404",
      content: "Emergency at location X"
    });

    // Now, have user404 retrieve their emergency history to verify the entry was added
    req = {
      auth: { username: "user404" },
      body: {
        who: "other"
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await emergencyHistoryController.handleGet(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json.mock.calls[0][0].history.length).toBe(1);
    expect(res.json.mock.calls[0][0].history[0]).toMatchObject({
      sender: "user404",
      content: "Emergency at location X",
      timestamp: expect.any(Date)
    });
  });

  test("5. User303 deletes an emergency history entry", async () => {
    // Set up emergency history for user404
    const timestamp = new Date();
    const timestampStr = timestamp.toISOString();

    // We need to simulate posting an emergency history that will be stored in user404's emergencyHistory
    // So set emergency contact for user303 and post emergency history
    req = {
      auth: { username: "user303" },
      body: {
        emergencyContact: {
          username: "user404",
          fullName: "User 404",
          email: "user404@example.com"
        }
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await emergencyContactController.handlePost(req, res);

    // Post emergency history from user303 with known timestamp
    req = {
      auth: { username: "user404" },
      body: {
        sender: "user404",
        timestamp,
        content: "Test entry"
        // Assume the timestamp is set internally by the controller
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await emergencyHistoryController.handlePost(req, res);

    // Retrieve the emergency history to get the timestamp
    req = {
      auth: { username: "user303" },
      body: {
        who: "self"
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await emergencyHistoryController.handleGet(req, res);
    const historyEntry = res.json.mock.calls[0][0].history.find(
      (entry) => entry.content === "Test entry"
    );
    expect(historyEntry).toBeDefined();

    // User404 deletes the entry
    req = {
      auth: { username: "user303" },
      body: {
        sender: "user404",
        timestamp: timestampStr,
        content: "Test entry"
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await emergencyHistoryController.handleDelete(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({
      message: "Emergency history deleted successfully"
    });
  });

  test("User303 cannot set themselves as emergency contact", async () => {
    req = {
      auth: { username: "user303" },
      body: {
        emergencyContact: {
          username: "user303",
          fullName: "User 303",
          email: "user303@example.com"
        }
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await expect(
      emergencyContactController.handlePost(req, res)
    ).rejects.toThrow(
      new HTTPError(HTTP_BAD_REQUEST, "Cannot set self as emergency contact")
    );
  });
});
