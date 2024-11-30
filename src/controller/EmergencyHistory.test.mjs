import { UserController } from "@/controller/User.mjs";
import { EmergencyHistoryController } from "@/controller/EmergencyHistory.mjs";
import { HTTP_OK } from "@/util/Constants.mjs";
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
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn()
};

describe("Test retrieve and set emergency contact", () => {
  let userController = undefined;
  let emergencyHistoryController = undefined;

  beforeEach(() => {
    userController = UserController.getInstance(
      mockRouter,
      mockContext,
      {},
      "/users"
    );
    userController.setUserDAO(mockUserDAO);

    emergencyHistoryController = EmergencyHistoryController.getInstance(
      mockRouter,
      mockContext,
      {},
      "/emergency-contact"
    );
    emergencyHistoryController.setUserDAO(mockUserDAO);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return no history when user has no emergencyHistory", async () => {
    const req = {
      body: { who: "self" },
      auth: { userId: 1 }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const userWithoutHistory = {
      username: "testUser",
      emergencyHistory: []
    };

    mockUserDAO.findById.mockResolvedValue(userWithoutHistory);

    await emergencyHistoryController.handleGet(req, res);

    expect(mockUserDAO.findById).toHaveBeenCalledWith({ userId: 1 });
    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({ history: [] });
  });

  test("should return no history when emergency contact has no emergencyHistory", async () => {
    const req = {
      body: { who: "other" },
      auth: { userId: 1 }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const userWithoutHistory = {
      username: "testUser",
      emergencyContactTo: 2,
      emergencyHistory: []
    };

    const emergencyContact = {
      username: "contactUser",
      emergencyHistory: []
    };

    mockUserDAO.findById
      .mockResolvedValueOnce(userWithoutHistory)
      .mockResolvedValueOnce(emergencyContact);

    await emergencyHistoryController.handleGet(req, res);

    expect(mockUserDAO.findById).toHaveBeenCalledWith({ userId: 1 });
    expect(mockUserDAO.findById).toHaveBeenCalledWith({ userId: 2 });
    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({ history: [] });
  });

  test("should return history normally", async () => {
    const req = {
      body: { who: "self" },
      auth: { userId: 1 }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const timestamp = new Date();
    const userWithHistory = {
      username: "testUser",
      emergencyHistory: [
        {
          sender: 2,
          timestamp: timestamp,
          content: "test"
        }
      ]
    };

    const senderUser = {
      username: "senderUser"
    };

    mockUserDAO.findById.mockResolvedValueOnce(userWithHistory);
    mockUserDAO.findById.mockResolvedValueOnce(senderUser);

    await emergencyHistoryController.handleGet(req, res);

    expect(mockUserDAO.findById).toHaveBeenCalledWith({ userId: 1 });
    expect(mockUserDAO.findById).toHaveBeenCalledWith({ userId: 2 });

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({
      history: [
        {
          sender: "senderuser",
          timestamp: timestamp,
          content: "test"
        }
      ]
    });
  });
});
