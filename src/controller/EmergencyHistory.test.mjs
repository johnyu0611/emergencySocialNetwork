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
      auth: { username: "testuser" }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const userWithoutHistory = {
      username: "testUser",
      emergencyHistory: []
    };

    mockUserDAO.findByUsername.mockResolvedValue(userWithoutHistory);

    await emergencyHistoryController.handleGet(req, res);

    expect(mockUserDAO.findByUsername).toHaveBeenCalledWith({
      username: "testuser"
    });
    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({ history: [] });
  });

  test("should return no history when emergency contact has no emergencyHistory", async () => {
    const req = {
      body: { who: "other" },
      auth: { username: "testuser" }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const userWithoutHistory = {
      username: "testUser",
      emergencyHistory: []
    };

    mockUserDAO.findByUsername.mockResolvedValue(userWithoutHistory);

    await emergencyHistoryController.handleGet(req, res);

    expect(mockUserDAO.findByUsername).toHaveBeenCalledWith({
      username: "testuser"
    });
    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({ history: [] });
  });

  test("should return history normally", async () => {
    const req = {
      body: { who: "self" }, // Correctly pass 'who' in req.body
      auth: { username: "testuser" }
      // Remove 'payload' as it's not used in handleGet
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const timestamp = new Date();
    const user = {
      username: "testuser",
      emergencyHistory: [
        {
          sender: "qwer", // Use 'sender' instead of 'emergencyContact'
          timestamp: timestamp, // Use 'timestamp' instead of 'time'
          content: "test"
        }
      ]
    };

    mockUserDAO.findByUsername.mockResolvedValue(user);

    await emergencyHistoryController.handleGet(req, res);

    expect(mockUserDAO.findByUsername).toHaveBeenCalledWith({
      username: "testuser"
    });
    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({
      history: [
        {
          sender: "qwer",
          timestamp: timestamp,
          content: "test"
        }
      ]
    });
  });
});
