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
    req = { body: {}, auth: { username: "testuser" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      username: "testuser"
    };
    mockUserDAO.findByUsername.mockResolvedValue(user);

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
    req = { body: {}, auth: { username: "testuser" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      username: "testuser",
      emergencyContact: {
        username: "qwer",
        fullName: "QWER",
        email: "123@gmail.com"
      }
    };

    const emergencyContact = {
      username: "qwer",
      isOnline: false
    };

    mockUserDAO.findByUsername
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(emergencyContact);

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
      auth: { username: "testuser" }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Simulate `findByUsername` returning null (user not found)
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

    // Ensure no response has been sent
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
      auth: { username: "testuser" }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Simulate `findByUsername` returning null (user not found)
    // mockUserDAO.findByUsername.mockResolvedValueOnce(null);

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

    // Ensure no response has been sent
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
      auth: { username: "testuser" }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const emergencyContact = {
      username: "qwer",
      emergencyContactTo: "wasd"
    };

    mockUserDAO.findByUsername.mockResolvedValueOnce(emergencyContact);

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

    // Ensure no response has been sent
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
      auth: { username: "testuser" }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const emergencyContact = {
      username: "qwer",
      emergencyContactTo: "testuser"
    };

    const testuser = {
      username: "testuser",
      emergencyContact: {
        username: "qwer",
        fullName: "QWER"
      }
    };

    mockUserDAO.findByUsername
      .mockResolvedValueOnce(emergencyContact)
      .mockResolvedValueOnce(testuser);

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
      auth: { username: "testuser" }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const emergencyContact = {
      username: "qwer"
    };

    const testuser = {
      username: "testuser"
    };

    mockUserDAO.findByUsername
      .mockResolvedValueOnce(emergencyContact)
      .mockResolvedValueOnce(testuser);

    await emergencyContactController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ emergencyContact: "qwer" });
  });
});
