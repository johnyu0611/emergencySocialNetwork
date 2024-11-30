import { UserController } from "@/controller/User.mjs";
import { EmergencyContactController } from "@/controller/EmergencyContact.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { HTTP_NOT_FOUND, HTTP_BAD_REQUEST } from "@/util/Constants.mjs";
import {
  jest,
  beforeEach,
  afterEach,
  expect,
  describe,
  test
} from "@jest/globals";

// Mock dependencies
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
  updateById: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn()
};

describe("Test retrieve and set emergency contact", () => {
  let userController = undefined;
  let emergencyContactController = undefined;
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

    emergencyContactController = EmergencyContactController.getInstance(
      mockRouter,
      mockContext,
      {},
      "/emergency-contact"
    );

    emergencyContactController.setUserDAO(mockUserDAO);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return an empty object with only curr field", async () => {
    req = { body: {}, auth: { userId: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      userId: 1,
      username: "testuser"
    };

    // Mock `findById` to return user twice (for user and curr)
    mockUserDAO.findById
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(user);

    await emergencyContactController.handleGet(req, res);

    expect(res.json).toHaveBeenCalledWith({
      curr: "testuser",
      email: "",
      fullName: "",
      isOnline: false,
      username: ""
    });
  });

  test("Should return an emergency contact object", async () => {
    req = { body: {}, auth: { userId: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      userId: 1,
      username: "testuser",
      emergencyContact: {
        username: 2,
        fullName: "QWER",
        email: "123@gmail.com"
      }
    };

    const emergencyContactUser = {
      userId: 2,
      username: "qwer",
      isOnline: false
    };

    mockUserDAO.findById
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(emergencyContactUser)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(emergencyContactUser);

    await emergencyContactController.handleGet(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      curr: "testuser",
      email: "123@gmail.com",
      fullName: "QWER",
      isOnline: false,
      username: "qwer"
    });
  });

  test("Should return 404 Not Found", async () => {
    const req = {
      body: {
        emergencyContact: {
          username: "qwer",
          fullName: "QWER",
          email: "123@gmail.com"
        }
      },
      auth: { userId: 1 }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockUserDAO.findByUsername.mockResolvedValueOnce(null);

    let error = undefined;
    try {
      await emergencyContactController.handlePost(req, res);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.status).toBe(HTTP_NOT_FOUND);
    expect(error.message).toBe("Emergency contact not found");

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("Should return 400: Cannot Set Self as Emergency Contact", async () => {
    const req = {
      body: {
        emergencyContact: {
          username: "testuser",
          fullName: "QWER",
          email: "123@gmail.com"
        }
      },
      auth: { userId: 1 }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      userId: 1,
      username: "testuser"
    };

    mockUserDAO.findByUsername.mockResolvedValueOnce(user);

    let error = undefined;
    try {
      await emergencyContactController.handlePost(req, res);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.status).toBe(HTTP_BAD_REQUEST);
    expect(error.message).toBe("Cannot set self as emergency contact");

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("Should return 400: Emergency Contact is not Available", async () => {
    const req = {
      body: {
        emergencyContact: {
          username: "qwer",
          fullName: "QWER",
          email: "123@gmail.com"
        }
      },
      auth: { userId: 1 }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      userId: 2,
      username: "qwer",
      emergencyContactTo: 3
    };

    mockUserDAO.findByUsername.mockResolvedValueOnce(user);

    let error = undefined;
    try {
      await emergencyContactController.handlePost(req, res);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.status).toBe(HTTP_BAD_REQUEST);
    expect(error.message).toBe("Emergency contact not available");

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("Should return 200 OK: same emergency contact can be re-added to the same citizen", async () => {
    const req = {
      body: {
        emergencyContact: {
          username: "qwer",
          fullName: "QWER",
          email: "123@gmail.com"
        }
      },
      auth: { userId: 1 }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const emergencyContactUser = {
      userId: 2,
      username: "qwer",
      emergencyContactTo: 1
    };

    const currUser = {
      userId: 1,
      username: "testuser",
      emergencyContact: {
        username: 2,
        fullName: "QWER"
      }
    };

    mockUserDAO.findByUsername.mockResolvedValueOnce(emergencyContactUser);

    mockUserDAO.findById.mockResolvedValueOnce(currUser);

    mockUserDAO.updateById.mockResolvedValue();

    await emergencyContactController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ emergencyContact: "qwer" });
  });

  test("Should return 200 OK: adding a new emergency contact", async () => {
    const req = {
      body: {
        emergencyContact: {
          username: "qwer",
          fullName: "QWER",
          email: "123@gmail.com"
        }
      },
      auth: { userId: 1 }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const emergencyContactUser = {
      userId: 2,
      username: "qwer",
      emergencyContactTo: -1
    };

    const currUser = {
      userId: 1,
      username: "testuser"
    };

    mockUserDAO.findByUsername.mockResolvedValueOnce(emergencyContactUser);

    mockUserDAO.findById.mockResolvedValueOnce(currUser);

    mockUserDAO.updateById.mockResolvedValue();

    await emergencyContactController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ emergencyContact: "qwer" });
  });
});
