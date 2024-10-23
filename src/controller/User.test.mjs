import { UserController } from "@/controller/User.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { HTTP_CREATED } from "@/util/Constants.mjs";
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
  update: jest.fn()
};

describe("UserController handlePost", () => {
  let userController = undefined;
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

    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should throw error if username is less than 3 characters", async () => {
    req.body = { username: "ab", password: "password123" };

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      HTTPError
    );

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      "Username should be at least 3 characters long"
    );
  });

  test("should throw error if username is greater than 32 characters", async () => {
    req.body = {
      username: "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz",
      password: "password123"
    };

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      HTTPError
    );

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      "Username should be at most 32 characters long"
    );
  });

  test("should throw error if username is a banned name -- admin", async () => {
    req.body = { username: "admin", password: "password123" };

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      HTTPError
    );

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      "Username should not be a banned name"
    );
  });

  test("should throw error if username is a banned name -- directory", async () => {
    req.body = { username: "directory", password: "password123" };

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      HTTPError
    );

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      "Username should not be a banned name"
    );
  });

  test("should throw error if username contains other than letters and numbers", async () => {
    req.body = { username: "abcde@", password: "password123" };

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      HTTPError
    );

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      "Username should only contain letters and digits"
    );
  });

  test("should throw error if username already exists", async () => {
    req.body = { username: "existinguser", password: "password123" };

    mockUserDAO.findByUsername.mockResolvedValue({ username: "existinguser" });

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      HTTPError
    );

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      "User already exists"
    );
  });

  test("should throw error if password is less than 4 characters", async () => {
    req.body = { username: "goodUsername", password: "123" };

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      HTTPError
    );

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      "Password should be at least 4 characters long"
    );
  });

  test("should throw error if password is greater than 64 characters", async () => {
    req.body = {
      username: "goodUsername",
      password:
        "123456781234567812345678123456781234567812345678123456781234567812345678"
    };

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      HTTPError
    );

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      "Password should be at most 64 characters long"
    );
  });

  test("should throw error if password contain non-printable ASCII characters", async () => {
    req.body = { username: "goodUsername", password: "123™" };

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      HTTPError
    );

    await expect(userController.handlePost(req, res)).rejects.toThrow(
      "Password should only contain printable ASCII characters"
    );
  });

  test("should create user successfully with valid username and password", async () => {
    req.body = { username: "validUser", password: "ValidPassword123" };
    mockUserDAO.findByUsername.mockResolvedValue(null);
    mockContext.passwordHasher.hash.mockResolvedValue("hashedPassword");
    mockContext.jwt.encode.mockReturnValue("validToken123");
    mockUserDAO.create.mockResolvedValue({
      id: 1,
      username: "validuser"
    });

    await userController.handlePost(req, res);

    expect(mockUserDAO.findByUsername).toHaveBeenCalledWith({
      username: "validuser"
    });
    expect(mockContext.passwordHasher.hash).toHaveBeenCalledWith(
      "ValidPassword123"
    );
    expect(mockContext.jwt.encode).toHaveBeenCalledWith({
      username: "validuser"
    });
    expect(mockUserDAO.create).toHaveBeenCalledWith({
      username: "validuser",
      password: "hashedPassword",
      status: "Undefined"
    });
    expect(res.status).toHaveBeenCalledWith(HTTP_CREATED);
    expect(res.json).toHaveBeenCalledWith({
      token: "validToken123"
    });
  });
});
