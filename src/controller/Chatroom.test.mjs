import { UserController } from "@/controller/User.mjs";
import { ChatroomController } from "@/controller/Chatroom.mjs";
import { MessageFactory } from "@/model/MessageFactory.mjs";
import {
  jest,
  beforeEach,
  afterEach,
  expect,
  describe,
  test
} from "@jest/globals";

// mock dependencies
const mockRouter = {
  use: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

const mockContext = {
  jwt: { encode: jest.fn() },
  passwordHasher: { hash: jest.fn() }
};

const mockUserDAO = {
  findByUsername: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn()
};

describe("Test Get Chatroom and contact lists", () => {
  let userController = undefined;
  let chatroomController = undefined;
  let messageModelMocks = undefined;
  let req = undefined;
  let res = undefined;
  beforeEach(() => {
    userController = UserController.getInstance(
      mockRouter,
      mockContext,
      {},
      "/users"
    );
    userController.setUserDAO(mockUserDAO);

    chatroomController = ChatroomController.getInstance(
      mockRouter,
      mockContext,
      {},
      "/chatrooms"
    );
    chatroomController.setUserDAO(mockUserDAO);

    messageModelMocks = {};

    MessageFactory.getModel = jest.fn((chatroomId) => {
      if (!messageModelMocks[chatroomId]) {
        messageModelMocks[chatroomId] = {
          findAll: jest.fn()
        };
      }
      return messageModelMocks[chatroomId];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return empty list", async () => {
    req = { body: { username: "testuser" }, auth: { username: "testuser" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      username: "testuser",
      chatrooms: []
    };
    mockUserDAO.findByUsername.mockResolvedValue(user);
    mockUserDAO.findAll.mockResolvedValue([user]);

    await chatroomController.handleGet(req, res);

    expect(res.json).toHaveBeenCalledWith({ chatrooms: [] });
  });

  test("Should return 1 username only", async () => {
    req = { body: { username: "testuser1" }, auth: { username: "testuser1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user1 = {
      username: "testuser1",
      status: "Undefined",
      chatrooms: []
    };

    const user2 = {
      username: "testuser2",
      status: "Undefined",
      chatrooms: []
    };
    mockUserDAO.findByUsername.mockResolvedValue(user1);
    mockUserDAO.findAll.mockResolvedValue([user1, user2]);

    await chatroomController.handleGet(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        chatrooms: [{ receiver: "testuser2", status: "Undefined" }]
      })
    );
  });

  test("Should return public chatroom only", async () => {
    req = { body: { username: "testuser1" }, auth: { username: "testuser1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user1 = {
      username: "testuser1",
      status: "Undefined",
      chatrooms: [{ id: "00000000-0000-0000-0000-000000000000" }]
    };

    mockUserDAO.findByUsername.mockResolvedValue(user1);
    mockUserDAO.findAll.mockResolvedValue([user1]);

    await chatroomController.handleGet(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        chatrooms: [
          {
            id: "00000000-0000-0000-0000-000000000000",
            title: "Public Chatroom"
          }
        ]
      })
    );
  });

  test("Should return public chatroom and 1 username", async () => {
    req = { body: { username: "testuser1" }, auth: { username: "testuser1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user1 = {
      username: "testuser1",
      status: "Undefined",
      chatrooms: [{ id: "00000000-0000-0000-0000-000000000000" }]
    };

    const user2 = {
      username: "testuser2",
      status: "Undefined",
      chatrooms: [{ id: "00000000-0000-0000-0000-000000000000" }]
    };

    mockUserDAO.findByUsername.mockResolvedValue(user1);
    mockUserDAO.findAll.mockResolvedValue([user1, user2]);

    await chatroomController.handleGet(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        chatrooms: [
          {
            id: "00000000-0000-0000-0000-000000000000",
            title: "Public Chatroom"
          },
          {
            receiver: "testuser2",
            status: "Undefined"
          }
        ]
      })
    );
  });

  test("Should return public chatroom and 1 private chatroom with no unread message", async () => {
    messageModelMocks = {
      "00000000-0000-0000-0000-000000000001": {
        findAll: jest.fn()
      }
    };
    req = { body: { username: "testuser1" }, auth: { username: "testuser1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user1 = {
      username: "testuser1",
      status: "Undefined",
      chatrooms: [
        {
          id: "00000000-0000-0000-0000-000000000000"
        },
        {
          id: "00000000-0000-0000-0000-000000000001",
          receiver: "testuser2"
        }
      ]
    };

    const user2 = {
      username: "testuser2",
      status: "Undefined",
      chatrooms: [
        {
          id: "00000000-0000-0000-0000-000000000000"
        },
        {
          id: "00000000-0000-0000-0000-000000000001",
          receiver: "testuser1"
        }
      ]
    };

    const message = {
      chatroomId: "00000000-0000-0000-0000-000000000001",
      readBy: ["testuser1"],
      sender: "user2",
      title: "00000000-0000-0000-0000-000000000001"
    };

    mockUserDAO.findByUsername.mockResolvedValue(user1);
    mockUserDAO.findAll.mockResolvedValue([user1, user2]);
    messageModelMocks[
      "00000000-0000-0000-0000-000000000001"
    ].findAll.mockResolvedValue([message]);

    await chatroomController.handleGet(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        chatrooms: [
          {
            id: "00000000-0000-0000-0000-000000000000",
            title: "Public Chatroom"
          },
          {
            hasUnread: false,
            id: "00000000-0000-0000-0000-000000000001",
            receiver: "testuser2",
            status: "Undefined",
            title: "00000000-0000-0000-0000-000000000001"
          }
        ]
      })
    );
  });

  test("Should return public chatroom and 1 private chatroom with unread message", async () => {
    messageModelMocks = {
      "00000000-0000-0000-0000-000000000001": {
        findAll: jest.fn()
      }
    };
    req = { body: { username: "testuser1" }, auth: { username: "testuser1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user1 = {
      username: "testuser1",
      status: "Undefined",
      chatrooms: [
        {
          id: "00000000-0000-0000-0000-000000000000"
        },
        {
          id: "00000000-0000-0000-0000-000000000001",
          receiver: "testuser2"
        }
      ]
    };

    const user2 = {
      username: "testuser2",
      status: "Undefined",
      chatrooms: [
        {
          id: "00000000-0000-0000-0000-000000000000"
        },
        {
          id: "00000000-0000-0000-0000-000000000001",
          receiver: "testuser1"
        }
      ]
    };

    const message = {
      chatroomId: "00000000-0000-0000-0000-000000000001",
      readBy: [],
      status: "Undefined",
      sender: "testuser2",
      title: "00000000-0000-0000-0000-000000000001"
    };

    mockUserDAO.findByUsername.mockResolvedValue(user1);
    mockUserDAO.findAll.mockResolvedValue([user1, user2]);
    messageModelMocks[
      "00000000-0000-0000-0000-000000000001"
    ].findAll.mockResolvedValue([message]);

    await chatroomController.handleGet(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        chatrooms: [
          {
            id: "00000000-0000-0000-0000-000000000000",
            title: "Public Chatroom"
          },
          {
            hasUnread: true,
            id: "00000000-0000-0000-0000-000000000001",
            receiver: "testuser2",
            status: "Undefined",
            title: "00000000-0000-0000-0000-000000000001"
          }
        ]
      })
    );
  });
});
