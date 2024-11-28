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
import { HTTP_CREATED } from "@/util/Constants.mjs";
import { MongoDBConnection } from "@/database/Connections.mjs";
import { runServer } from "@/Server.mjs";
import { config } from "@/config/Config.mjs";
import { ChatroomMessageController } from "@/controller/ChatroomMessage.mjs";

describe("Integration test for PostAnnouncement & SearchInformation", () => {
  let userController = undefined;
  let req = undefined;
  let res = undefined;
  let server = undefined;
  let chatroomMessageController = undefined;

  beforeAll(async () => {
    config.environment.databaseUser = "hanzhi";
    config.environment.databasePassword = "hanzhi";
    config.environment.databaseCluster = "fse.qw9qk.mongodb.net";
    config.environment.databaseName = "IntegrationTest3";
    config.environment.databaseAppName = "FSE";
    config.environment.jwtPreSharedKey = "FSE-SB1";

    config.environment.port = 3300;
    server = await runServer();
    userController = UserController.getInstance();
    chatroomMessageController = ChatroomMessageController.getInstance();
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

  test("should make an announcement ", async () => {
    req = {
      params: { chatroomId: "11111111-1111-1111-1111-111111111111" },
      body: { content: "Hi!" },
      auth: { username: "user303" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await chatroomMessageController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_CREATED);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({}));
  }, 50000);

  test("should get all announcements", async () => {
    req = {
      params: { chatroomId: "11111111-1111-1111-1111-111111111111" },
      body: { content: "Hello 1" },
      auth: { username: "user303" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await chatroomMessageController.handlePost(req, res);

    req = {
      params: { chatroomId: "11111111-1111-1111-1111-111111111111" },
      body: {},
      auth: { username: "user404" }
    };
    res = {
      json: jest.fn()
    };
    await chatroomMessageController.handleGet(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            sender: "user303",
            content: "Hello 1"
          })
        ])
      })
    );
  }, 50000);

  test("should searchz all announcements", async () => {
    req = {
      params: { chatroomId: "11111111-1111-1111-1111-111111111111" },
      body: { content: "Hello 1" },
      auth: { username: "user303" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await chatroomMessageController.handlePost(req, res);

    req = {
      params: { chatroomId: "11111111-1111-1111-1111-111111111111" },
      body: { searchBy: { content: "Hello" } },
      auth: { username: "user404" }
    };
    res = {
      json: jest.fn()
    };
    await chatroomMessageController.handleGet(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            sender: "user303",
            content: "Hello 1"
          })
        ])
      })
    );
  }, 50000);

  test("should return no content", async () => {
    req = {
      params: { chatroomId: "11111111-1111-1111-1111-111111111111" },
      body: { content: "Hello 1" },
      auth: { username: "user303" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await chatroomMessageController.handlePost(req, res);

    req = {
      params: { chatroomId: "11111111-1111-1111-1111-111111111111" },
      body: { searchBy: { content: "Test" } },
      auth: { username: "user404" }
    };
    res = {
      json: jest.fn()
    };
    await chatroomMessageController.handleGet(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([])
      })
    );
  }, 50000);

  test("should return 2 user", async () => {
    req = {
      body: { searchBy: { username: "user" } },
      auth: { username: "user404" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await userController.handleGet(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        users: [
          { isOnline: true, status: "OK", username: "user303" },
          { isOnline: true, status: "Help", username: "user404" }
        ]
      })
    );
  }, 50000);
});
