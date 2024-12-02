// __tests__/AdministrationController.test.mjs

import { AdministrationController } from "@/controller/Administration.mjs";
import { UserDataAccess } from "@/model/User.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { TokenController } from "@/controller/Token.mjs";
import { UserController } from "@/controller/User.mjs";
import { HTTP_OK, HTTP_CREATED } from "@/util/Constants.mjs";
import {
  jest,
  describe,
  beforeEach,
  afterEach,
  test,
  expect
} from "@jest/globals";
import { createDefaultAdmin } from "@/util/CreateDefaultAdministrator.mjs";
import { PasswordHasher } from "@/util/PasswordHasher.mjs";
import { ZodError } from "zod";
import { validateUsername } from "@/util/ValidateUsername.mjs";
import { validatePassword } from "@/util/ValidatePassword.mjs";

// Mock dependencies
jest.mock("@/model/User.mjs");

describe("At-Least-One-Administrator Rule", () => {
  let adminController = undefined;
  let mockRouter = undefined;
  let mockUserDAO = undefined;

  beforeEach(() => {
    // Mock router
    mockRouter = {
      use: jest.fn()
    };

    // Mock UserDataAccess
    mockUserDAO = {
      findById: jest.fn(),
      find: jest.fn(),
      getAllAdmins: jest.fn(),
      updateById: jest.fn()
    };
    UserDataAccess.getInstance.mockReturnValue(mockUserDAO);

    // Initialize AdministrationController
    adminController = AdministrationController.getInstance(
      mockRouter, // Mocked upstreamRouter
      {}, // Context
      {}, // Middleware map
      "/administration"
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should prevent the sole Administrator from changing their own privilege", async () => {
    const soleAdmin = {
      userId: 1,
      username: "ESNAdmin",
      privilege: "Administrator",
      isActive: true,
      isOnline: true
    };

    // Mock the user retrieval to return the sole admin
    mockUserDAO.findById.mockResolvedValue(soleAdmin);
    mockUserDAO.find.mockResolvedValue([soleAdmin]);

    // Mock request and response objects
    const req = {
      body: {
        citizenId: 1, // Numeric ID matching schema
        privilege: "citizen", // Attempting to downgrade privilege
        validation: false
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Execute the handlePost method
    await adminController.handlePost(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      citizenId: 1,
      isActive: true,
      isOnline: true,
      privilege: "Administrator",
      status: undefined,
      username: "esnadmin"
    });
  });
});

// __tests__/AdministrationController.test.mjs

// Mock dependencies
jest.mock("@/model/User.mjs");
jest.mock("@/util/PasswordHasher.mjs");

describe("Initial Administrator Rule", () => {
  let mockUserDAO = undefined;
  let mockPasswordHasher = undefined;

  beforeEach(() => {
    // Mock UserDataAccess
    mockUserDAO = {
      findByUsername: jest.fn(),
      create: jest.fn()
    };
    UserDataAccess.getInstance.mockReturnValue(mockUserDAO);

    // Mock PasswordHasher
    mockPasswordHasher = {
      hash: jest.fn().mockResolvedValue("hashed_admin_password")
    };
    PasswordHasher.mockImplementation(() => mockPasswordHasher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should ensure the Initial Administrator account (ESNAdmin) exists", async () => {
    // Mock to simulate that the ESNAdmin account does not exist yet
    mockUserDAO.findByUsername.mockResolvedValue(null);

    // Call the createDefaultAdmin function
    await createDefaultAdmin();

    // Assertions
    expect(mockUserDAO.findByUsername).toHaveBeenCalledWith({
      username: "esnadmin"
    });
    expect(mockUserDAO.create).toHaveBeenCalledWith({
      username: "esnadmin",
      password: "hashed_admin_password", // Mocked hashed password
      status: "OK",
      isOnline: false,
      privilege: "administrator"
    });
  });

  test("Should not create the Initial Administrator account if it already exists", async () => {
    // Mock to simulate that the ESNAdmin account already exists
    mockUserDAO.findByUsername.mockResolvedValue({ username: "esnadmin" });

    // Call the createDefaultAdmin function
    await createDefaultAdmin();

    // Assertions
    expect(mockUserDAO.findByUsername).toHaveBeenCalledWith({
      username: "esnadmin"
    });
    expect(mockUserDAO.create).not.toHaveBeenCalled();
  });
});

describe("Administrator Action of User Profile Rule", () => {
  let adminController = undefined;
  let mockRouter = undefined;
  let mockUserDAO = undefined;
  let mockSystem = undefined;

  beforeEach(() => {
    // Mock router
    mockRouter = {
      use: jest.fn()
    };

    // Mock UserDataAccess
    mockUserDAO = {
      findById: jest.fn(),
      updateById: jest.fn()
    };
    UserDataAccess.getInstance.mockReturnValue(mockUserDAO);

    // Mock context.channel.system
    mockSystem = {
      emit: jest.fn()
    };
    adminController = AdministrationController.getInstance(
      mockRouter,
      { channel: { system: mockSystem } }, // Mocked context with system
      {}, // Middleware map
      "/administration"
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should throw error if password is greater than 64 characters", async () => {
    const password =
      "123456781234567812345678123456781234567812345678123456781234567812345678";

    expect(() => validatePassword(password)).toThrow(ZodError);
    try {
      validatePassword(password);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Password exceeded maximum length limit"
      );
    }
  });

  test("should throw error if username contains other than letters and numbers", async () => {
    const username = "abcd@";

    expect(() => validateUsername(username)).toThrow(ZodError);
    try {
      validateUsername(username);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Username contains illegal characters"
      );
    }
  });
  test("should return the same username even they have difference cases", async () => {
    const username1 = "abcd";
    const username2 = "ABCD";

    expect(validateUsername(username1)).toBe(validateUsername(username2));
  });

  test("should throw error if password is less than 4 characters", async () => {
    const password = "ab";

    expect(() => validatePassword(password)).toThrow(ZodError);
    try {
      validatePassword(password);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Password should be at least 4 characters long"
      );
    }
  });

  test("should throw error if username is less than 3 characters", async () => {
    const username = "ab";

    expect(() => validateUsername(username)).toThrow(ZodError);
    try {
      validateUsername(username);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].message).toBe(
        "Username should be at least 3 characters long"
      );
    }
  });

  test("Should not allow Administrator to change another user's emergency status (negative test)", async () => {
    const targetUser = { userId: 5, emergencyStatus: "Normal" };
    mockUserDAO.findById.mockResolvedValue(targetUser);

    const req = {
      body: { citizenId: 5, status: "OK", validation: false }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await adminController.handlePost(req, res);

    // Assertions
    expect(mockUserDAO.updateById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      citizenId: 5,
      isActive: true,
      isOnline: true,
      privilege: "Administrator",
      status: undefined,
      username: "esnadmin"
    });
  });
});

// Mock dependencies
jest.mock("@/model/User.mjs");

describe("Privilege Rule", () => {
  let adminController = undefined;
  let mockRouter = undefined;
  let mockUserDAO = undefined;

  beforeEach(() => {
    // Mock router
    mockRouter = {
      use: jest.fn()
    };

    // Mock UserDataAccess
    mockUserDAO = {
      find: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      getAllAdmins: jest.fn()
    };
    UserDataAccess.getInstance.mockReturnValue(mockUserDAO);

    // Mock context
    adminController = AdministrationController.getInstance(
      mockRouter,
      {}, // Context
      {}, // Middleware map
      "/administration"
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should not allow privilege downgrade of the sole Administrator", async () => {
    const admins = [{ userId: 1, privilege: "Administrator", isActive: true }];
    mockUserDAO.find.mockResolvedValue(admins);

    const req = {
      body: { citizenId: 1, privilege: "Coordinator", validation: true }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await adminController.handlePost(req, res);

    expect(mockUserDAO.updateById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      citizenId: 1,
      passwordFlag: "",
      privilegeFlag: "",
      userFlag: ""
    });
  });
});

// Mock dependencies
jest.mock("@/model/User.mjs");

describe("Active-Inactive Rule - Login Scenarios", () => {
  let tokenController = undefined;
  let mockRouter = undefined;
  let mockUserDAO = undefined;
  let mockJWT = undefined;
  let mockPasswordHasher = undefined;
  let userController = undefined;
  beforeEach(() => {
    // Mock router
    mockRouter = { use: jest.fn() };

    // Mock UserDataAccess
    mockUserDAO = {
      findByUsername: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      updateById: jest.fn(),
      create: jest.fn()
    };
    UserDataAccess.getInstance.mockReturnValue(mockUserDAO);

    // Mock JWT
    mockJWT = {
      encode: jest.fn().mockReturnValue("mocked_token")
    };

    // Mock PasswordHasher
    mockPasswordHasher = {
      hash: jest.fn().mockResolvedValue("hashed_password"),
      verify: jest.fn().mockResolvedValue(true)
    };

    const mockContext = {
      jwt: { encode: jest.fn().mockReturnValue("mocked_token") },
      passwordHasher: { hash: jest.fn() }
    };

    // Initialize the controller with mocked context
    tokenController = TokenController.getInstance(
      mockRouter,
      { jwt: mockJWT, passwordHasher: mockPasswordHasher }, // Context
      {}, // Middleware map
      "/tokens"
    );

    tokenController.setUserDAO(mockUserDAO);

    userController = UserController.getInstance(
      mockRouter,
      mockContext,
      {},
      "/users"
    );
    userController.setUserDAO(mockUserDAO);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Active user can log in successfully
  test("Should allow login for an active user", async () => {
    const activeUser = {
      userId: 1,
      username: "activeUser",
      password: "hashed_password",
      isActive: true,
      privilege: "Citizen"
    };

    mockUserDAO.findByUsername.mockResolvedValue(activeUser);

    const req = {
      body: { username: "activeuser", password: "password123" }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await tokenController.handlePost(req, res);

    expect(mockUserDAO.findByUsername).toHaveBeenCalledWith({
      username: "activeuser"
    });
    expect(mockPasswordHasher.verify).toHaveBeenCalledWith(
      "hashed_password",
      "password123"
    );
    expect(mockUserDAO.update).toHaveBeenCalledWith(
      { username: "activeuser" },
      { isOnline: true }
    );
    expect(mockJWT.encode).toHaveBeenCalledWith({ userId: 1 });
    expect(res.status).toHaveBeenCalledWith(HTTP_CREATED);
    expect(res.json).toHaveBeenCalledWith({
      token: "mocked_token",
      privilege: "Citizen"
    });
  });

  // 2
  test("Should prevent login for an inactive user", async () => {
    const inactiveUser = {
      userId: 2,
      username: "inactiveUser",
      password: "hashed_password",
      isActive: false
    };

    mockUserDAO.findByUsername.mockResolvedValue(inactiveUser);
    mockPasswordHasher.verify.mockResolvedValue(true);

    const req = { body: { username: "inactiveUser", password: "password123" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Debugging
    console.log("Mocked User DAO:", mockUserDAO.findByUsername.mock.results);
    console.log(
      "Mocked Password Hasher:",
      mockPasswordHasher.verify.mock.results
    );

    // Expect exception
    await expect(tokenController.handlePost(req, res)).rejects.toThrow(
      HTTPError
    );

    expect(mockUserDAO.findByUsername).toHaveBeenCalledWith({
      username: "inactiveuser"
    });
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // 3
  test("Should prevent search username has inactive user", async () => {
    const inactiveUser = {
      userId: 2,
      username: "inactiveUser",
      password: "hashed_password",
      isActive: false
    };

    const users = [inactiveUser];
    mockUserDAO.findByUsername.mockResolvedValue(inactiveUser);
    mockUserDAO.find.mockResolvedValue(users);

    const req = {
      body: {
        searchBy: { username: "ser" }
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await userController.handleGet(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({
      users: []
    });
  });

  // 4
  test("Should prevent search status has inactive user", async () => {
    const inactiveUser = {
      userId: 2,
      username: "inactiveUser",
      status: "OK",
      password: "hashed_password",
      isActive: false
    };

    const users = [inactiveUser];
    mockUserDAO.findByUsername.mockResolvedValue(inactiveUser);
    mockUserDAO.find.mockResolvedValue(users);

    const req = {
      body: {
        searchBy: { status: "OK" }
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await userController.handleGet(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({
      users: []
    });
  });

  // 5
  test("Should allow login after user is reactivated", async () => {
    const inactiveUser = {
      userId: 3,
      username: "reactivatedUser",
      password: "hashed_password",
      isActive: false,
      privilege: "citizen"
    };

    mockUserDAO.findByUsername.mockResolvedValue(inactiveUser);

    const loginReq1 = {
      body: { username: "reactivatedUser", password: "password123" }
    };
    const res1 = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await expect(tokenController.handlePost(loginReq1, res1)).rejects.toThrow(
      HTTPError
    );

    inactiveUser.isActive = true;

    mockUserDAO.findByUsername.mockResolvedValue(inactiveUser);

    const loginReq2 = {
      body: { username: "reactivatedUser", password: "password123" }
    };
    const res2 = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await tokenController.handlePost(loginReq2, res2);

    expect(mockUserDAO.findByUsername).toHaveBeenCalledWith({
      username: "reactivateduser"
    });

    expect(mockUserDAO.update).toHaveBeenCalledWith(
      { username: "reactivateduser" },
      { isOnline: true }
    );

    expect(res2.status).toHaveBeenCalledWith(HTTP_CREATED);
    expect(res2.json).toHaveBeenCalledWith({
      token: "mocked_token",
      privilege: "citizen"
    });
  });
});
