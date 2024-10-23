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
import { HTTP_OK, HTTP_CREATED } from "@/util/Constants.mjs";
import { MongoDBConnection } from "@/database/Connections.mjs";
import { runServer } from "@/Server.mjs";
import { config } from "@/config/Config.mjs";
import { StatusController } from "../../controller/Status.mjs";
import { ChatroomController } from "@/controller/Chatroom.mjs";
import { ChatroomMessageController } from "@/controller/ChatroomMessage.mjs";

describe("Integration test for ShareStatus & ChatPrivately", () => {
  let userController = undefined;
  let statusController = undefined;
  let chatroomController = undefined;
  let req = undefined;
  let res = undefined;
  let server = undefined;
  let chatroomMessageController = undefined;

  beforeAll(async () => {
    config.environment.databaseUser = "hanzhi";
    config.environment.databasePassword = "hanzhi";
    config.environment.databaseCluster = "fse.qw9qk.mongodb.net";
    config.environment.databaseName = "IntegrationTest";
    config.environment.databaseAppName = "FSE";
    config.environment.jwtPreSharedKey = "FSE-SB1";

    server = await runServer();
    userController = UserController.getInstance();
    statusController = StatusController.getInstance();
    chatroomController = ChatroomController.getInstance();
    chatroomMessageController = ChatroomMessageController.getInstance();
  });

  beforeEach(async () => {
    req = {
      body: {
        username: "user101",
        password: "password1",
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
        username: "user202",
        password: "password2",
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

  test("should create user with predefined status and check in the database", async () => {
    req = { body: { status: "Help" }, auth: { username: "user101" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await statusController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "Help"
      })
    );
  });

  test("should get the status of a user that is already in the database", async () => {
    req = { body: { username: "user101" }, auth: { username: "user101" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await statusController.handleGet(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "OK"
      })
    );
  });

  test("should create chatroom for two users", async () => {
    req = { body: { receiver: "user202" }, auth: { username: "user101" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await chatroomController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_CREATED);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        receiver: "user202"
      })
    );
  });

  test("should get chatroom for user101", async () => {
    req = { body: {}, auth: { username: "user101" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await chatroomController.handleGet(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        chatrooms: [
          {
            id: "00000000-0000-0000-0000-000000000000",
            title: "Public Chatroom"
          },
          { receiver: "user202", status: "Help" }
        ]
      })
    );
  });

  test("should get chatroom message for one chatroom", async () => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    req = { body: { receiver: "user202" }, auth: { username: "user101" } };
    await chatroomController.handlePost(req, res);
    req = { body: {}, auth: { username: "user101" } };
    await chatroomController.handleGet(req, res);
    const [[responseData]] = res.json.mock.calls;
    req = {
      params: { chatroomId: responseData.id },
      body: { content: "Hi" },
      auth: { username: "user101" }
    };
    await chatroomMessageController.handlePost(req, res);
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    req = {
      params: { chatroomId: responseData.id },
      body: {},
      auth: { username: "user101" }
    };
    await chatroomMessageController.handleGet(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: "Hi"
          })
        ])
      })
    );
  });

  test("should get 2 chatrooms for user101", async () => {
    req = { body: { receiver: "user202" }, auth: { username: "user101" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await chatroomController.handlePost(req, res);

    req = { body: {}, auth: { username: "user101" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await chatroomController.handleGet(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        chatrooms: [
          {
            id: "00000000-0000-0000-0000-000000000000",
            title: "Public Chatroom"
          },
          {
            hasUnread: false,
            id: expect.any(String),
            receiver: "user202",
            status: "Help",
            title: expect.any(String)
          }
        ]
      })
    );
  });
});
