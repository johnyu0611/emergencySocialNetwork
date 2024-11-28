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
import { MedicalCenterController } from "@/controller/MedicalCenter.mjs";
import { ReviewController } from "@/controller/Review.mjs";

describe("Integration test for Iteration 4", () => {
  let medicalcenterController = undefined;
  let reviewController = undefined;
  let userController = undefined;
  let req = undefined;
  let res = undefined;
  let server = undefined;

  beforeAll(async () => {
    config.environment.databaseUser = "hanzhi";
    config.environment.databasePassword = "hanzhi";
    config.environment.databaseCluster = "fse.qw9qk.mongodb.net";
    config.environment.databaseName = "IntegrationTest4-vxie";
    config.environment.databaseAppName = "FSE";
    config.environment.jwtPreSharedKey = "FSE-SB1";
    config.environment.port = 3403;
    server = await runServer();
    medicalcenterController = MedicalCenterController.getInstance();
    reviewController = ReviewController.getInstance();
    userController = UserController.getInstance();
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

  test("should create medical center in the database", async () => {
    req = {
      body: {
        location: {
          latitude: 37.4032957,
          longitude: -122.0628796
        },
        title: "MC 1",
        introduction: "Good",
        address: "503 Tyrella Avenue, Mountain View, CA 94043-2128, USA"
      },
      auth: { username: "user101" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await medicalcenterController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_CREATED);
  });

  test("create medical center with same location in the database throw error", async () => {
    req = {
      body: {
        location: {
          latitude: 37.4032957,
          longitude: -122.0628796
        },
        title: "MC 1",
        introduction: "Good",
        address: "503 Tyrella Avenue, Mountain View, CA 94043-2128, USA"
      },
      auth: { username: "user101" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await medicalcenterController.handlePost(req, res);

    req = {
      body: {
        location: {
          latitude: 37.4032957,
          longitude: -122.0628796
        },
        title: "MC 2",
        introduction: "Good....",
        address: "503 Tyrella Avenue, Mountain View, CA 94043-2128, USA"
      },
      auth: { username: "user101" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    try {
      await medicalcenterController.handlePost(req, res);
    } catch (error) {
      expect(error.message).toBe("MC already exists");
    }
  });

  test("should get the medical center in the database", async () => {
    req = {
      body: {
        location: {
          latitude: 37.4032957,
          longitude: -122.0628796
        },
        title: "MC 1",
        introduction: "Good",
        address: "503 Tyrella Avenue, Mountain View, CA 94043-2128, USA"
      },
      auth: { username: "user101" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await medicalcenterController.handlePost(req, res);
    req = { body: {}, auth: { username: "user101" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await medicalcenterController.handleGet(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        medicalcenters: [
          expect.objectContaining({
            address: "503 Tyrella Avenue, Mountain View, CA 94043-2128, USA",
            introduction: "Good",
            isUser: true,
            location: { latitude: 37.4032957, longitude: -122.0628796 },
            title: "MC 1"
          })
        ]
      })
    );
  });

  test("should delete the medical center in the database", async () => {
    req = {
      body: {
        location: {
          latitude: 37.4032957,
          longitude: -122.0628796
        },
        title: "MC 1",
        introduction: "Good",
        address: "503 Tyrella Avenue, Mountain View, CA 94043-2128, USA"
      },
      auth: { username: "user101" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await medicalcenterController.handlePost(req, res);
    req = { body: {}, auth: { username: "user101" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await medicalcenterController.handleGet(req, res);
    const [[createdMedicalCenter]] = res.json.mock.calls;
    const mcID = createdMedicalCenter.medicalcenters[0].mcId;
    req = { body: { mcId: mcID }, auth: { username: "user101" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await medicalcenterController.handleDelete(req, res);
    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
  });

  test("should post the review in the database", async () => {
    req = {
      body: {
        location: {
          latitude: 37.4032957,
          longitude: -122.0628796
        },
        title: "MC 1",
        introduction: "Good",
        address: "503 Tyrella Avenue, Mountain View, CA 94043-2128, USA"
      },
      auth: { username: "user101" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await medicalcenterController.handlePost(req, res);
    req = { body: {}, auth: { username: "user101" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await medicalcenterController.handleGet(req, res);
    const [[createdMedicalCenter]] = res.json.mock.calls;
    const mcID = createdMedicalCenter.medicalcenters[0].mcId;
    req = {
      body: { mcId: mcID, content: "good", rate: 4 },
      auth: { username: "user101" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await reviewController.handlePost(req, res);
    expect(res.status).toHaveBeenCalledWith(HTTP_CREATED);
  });

  test("should get the review in the database", async () => {
    req = {
      body: {
        location: {
          latitude: 37.4032957,
          longitude: -122.0628796
        },
        title: "MC 1",
        introduction: "Good",
        address: "503 Tyrella Avenue, Mountain View, CA 94043-2128, USA"
      },
      auth: { username: "user101" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await medicalcenterController.handlePost(req, res);
    req = { body: {}, auth: { username: "user101" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await medicalcenterController.handleGet(req, res);
    const [[createdMedicalCenter]] = res.json.mock.calls;
    const mcID = createdMedicalCenter.medicalcenters[0].mcId;
    req = {
      body: { mcId: mcID, content: "good", rate: 4 },
      auth: { username: "user101" }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await reviewController.handlePost(req, res);

    req = { body: { mcId: mcID }, auth: { username: "user101" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    await reviewController.handleGet(req, res);
    expect(res.status).toHaveBeenCalledWith(HTTP_OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        reviews: [
          expect.objectContaining({
            content: "good"
          })
        ]
      })
    );
  });
});
