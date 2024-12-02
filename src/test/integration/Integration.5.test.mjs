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
import { HTTP_OK } from "@/util/Constants.mjs";
import { MongoDBConnection } from "@/database/Connections.mjs";
import { runServer } from "@/Server.mjs";
import { config } from "@/config/Config.mjs";
import { AdministrationController } from "@/controller/Administration.mjs";

describe("Test validate and administration user profile", () => {
  let userController = undefined;
  let req = undefined;
  let res = undefined;
  let server = undefined;
  let administrationController = undefined;

  beforeAll(async () => {
    config.environment.databaseUser = "hanzhi";
    config.environment.databasePassword = "hanzhi";
    config.environment.databaseCluster = "fse.qw9qk.mongodb.net";
    config.environment.databaseName = "IntegrationTestI5";
    config.environment.databaseAppName = "FSE";
    config.environment.jwtPreSharedKey = "FSE-SB1";

    config.environment.port = 3436;
    server = await runServer();
    userController = UserController.getInstance();
    administrationController = AdministrationController.getInstance();
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

  test("should validate username and password when validation is true", async () => {
    const req = {
      body: {
        citizenId: 1,
        username: "validuser",
        password: "validpassword",
        validation: true
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await administrationController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({
      citizenId: 1,
      userFlag: "",
      passwordFlag: "",
      privilegeFlag: ""
    });
  });

  test("should return error when username is invalid", async () => {
    const req = {
      body: {
        citizenId: 1,
        username: "us",
        password: "validpassword",
        validation: true
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await administrationController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({
      citizenId: 1,
      userFlag:
        "Username should be longer than 2 chars and shorter than 32 chars with no banned words",
      passwordFlag: "",
      privilegeFlag: ""
    });
  });

  test("should return error when username is already taken", async () => {
    const req = {
      body: {
        citizenId: 1,
        username: "user303",
        password: "validpassword",
        validation: true
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await administrationController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({
      citizenId: 1,
      userFlag: "Username unavailable",
      passwordFlag: "",
      privilegeFlag: ""
    });
  });

  test("should update when validation is false", async () => {
    const req = {
      body: {
        citizenId: 1,
        password: "newpassword123",
        username: "rrrrr",
        isActive: false,
        privilege: "coordinator",
        validation: false
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await administrationController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({
      citizenId: 1,
      isActive: false,
      isOnline: true,
      privilege: "coordinator",
      status: "OK",
      username: "rrrrr"
    });
  });

  test("should retrieve user information", async () => {
    const req = {
      body: {
        citizenId: 1
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await administrationController.handleGet(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith({
      citizenId: 1,
      privilege: "citizen",
      status: "OK",
      isActive: true,
      isOnline: true,
      username: "user303"
    });
  });
});
