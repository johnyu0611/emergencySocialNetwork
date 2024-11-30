import { LocationSharingSessionController } from "@/controller/LocationSharingSession.mjs";
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
import { HTTP_CREATED } from "@/util/Constants.mjs";
import { MongoDBConnection } from "@/database/Connections.mjs";
import { runServer } from "@/Server.mjs";
import { config } from "@/config/Config.mjs";
import { UserController } from "@/controller/User.mjs";
import { LocationSharingSessionIdController } from "@/controller/LocationSharingSessionId.mjs";
import { LocationSharingSessionUserController } from "@/controller/LocationSharingSessionUser.mjs";
import { LocationSharingSessionUserLastSeenController } from "@/controller/LocationSharingSessionUserLastSeen.mjs";
import { LocationSharingSessionUserLocationController } from "@/controller/LocationSharingSessionUserLocation.mjs";
import { LocationSharingSessionUserResourceRequestController } from "@/controller/LocationSharingSessionUserResourceRequest.mjs";
import { LocationSharingSessionUserResourceResponseController } from "@/controller/LocationSharingSessionUserResourceResponse.mjs";
import { ZodError } from "zod";

const regexUUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

function getJWTPayload(token) {
  return JSON.parse(atob(token.split(".")[1]));
}

describe("Integration test for PostAnnouncement & SearchInformation", () => {
  let userController = undefined;
  let locationSharingSessionController = undefined;
  let locationSharingSessionIdController = undefined;
  let locationSharingSessionUserController = undefined;
  let locationSharingSessionUserLastSeenController = undefined;
  let locationSharingSessionUserLocationController = undefined;
  let locationSharingSessionUserResourceRequestController = undefined;
  let locationSharingSessionUserResourceResponseController = undefined;
  let req = undefined;
  let res = undefined;
  let server = undefined;
  let sessionId = undefined;
  let user401Id = undefined;
  let user402Id = undefined;
  beforeAll(async () => {
    config.environment.databaseUser = "hanzhi";
    config.environment.databasePassword = "hanzhi";
    config.environment.databaseCluster = "fse.qw9qk.mongodb.net";
    config.environment.databaseName = "Integration-Test-4-Jake";
    config.environment.databaseAppName = "FSE";
    config.environment.jwtPreSharedKey = "FSE-SB1";

    config.environment.port = 3401;
    server = await runServer();
    userController = UserController.getInstance();
    locationSharingSessionController =
      LocationSharingSessionController.getInstance();
    locationSharingSessionIdController =
      LocationSharingSessionIdController.getInstance();
    locationSharingSessionUserController =
      LocationSharingSessionUserController.getInstance();
    locationSharingSessionUserLastSeenController =
      LocationSharingSessionUserLastSeenController.getInstance();
    locationSharingSessionUserLocationController =
      LocationSharingSessionUserLocationController.getInstance();
    locationSharingSessionUserResourceRequestController =
      LocationSharingSessionUserResourceRequestController.getInstance();
    locationSharingSessionUserResourceResponseController =
      LocationSharingSessionUserResourceResponseController.getInstance();
  });

  beforeEach(async () => {
    req = {
      body: {
        username: "user401",
        password: "password",
        isOnline: true,
        status: "OK",
        chatrooms: []
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(({ token }) => {
        const { userId } = getJWTPayload(token);
        user401Id = userId;
      })
    };
    await userController.handlePost(req, res);

    req = {
      body: {
        username: "user402",
        password: "password",
        isOnline: true,
        status: "Help",
        chatrooms: []
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(({ token }) => {
        const { userId } = getJWTPayload(token);
        user402Id = userId;
      })
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

  test("Test bad request: should not create a session", async () => {
    req = {
      body: {},
      auth: { userId: user401Id }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await expect(
      locationSharingSessionController.handlePost(req, res)
    ).rejects.toThrow(ZodError);
  }, 50000);

  test("Test normal request: create a session", async () => {
    req = {
      body: {
        location: {
          longitude: 18.652,
          latitude: 18.652
        }
      },
      auth: { userId: user401Id }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(({ id }) => {
        sessionId = id;
      })
    };

    await locationSharingSessionController.handlePost(req, res);

    expect(res.status).toHaveBeenCalledWith(HTTP_CREATED);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(regexUUID)
      })
    );
  }, 50000);

  test("Test bad request: try to delete session with no permission", async () => {
    req = {
      body: {
        location: {
          longitude: 18.652,
          latitude: 18.652
        }
      },
      auth: { userId: user401Id }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(({ id }) => {
        sessionId = id;
      })
    };

    await locationSharingSessionController.handlePost(req, res);

    req = {
      params: {
        sessionId
      },
      body: {},
      auth: { userId: user402Id }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await expect(
      locationSharingSessionIdController.handleDelete(req, res)
    ).rejects.toThrow("Must be the initiator to delete the session");
  }, 50000);

  test("Test normal request: delete a session", async () => {
    req = {
      body: {
        location: {
          longitude: 18.652,
          latitude: 18.652
        }
      },
      auth: { userId: user401Id }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(({ id }) => {
        sessionId = id;
      })
    };

    await locationSharingSessionController.handlePost(req, res);

    req = {
      params: {
        sessionId
      },
      body: {
        location: {
          longitude: 18.652,
          latitude: 18.652
        }
      },
      auth: { userId: user401Id }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await locationSharingSessionIdController.handleDelete(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({}));
  }, 50000);

  test("Test normal request: join created session", async () => {
    req = {
      body: {
        location: {
          longitude: 18.652,
          latitude: 18.652
        }
      },
      auth: { userId: user401Id }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(({ id }) => {
        sessionId = id;
      })
    };

    await locationSharingSessionController.handlePost(req, res);

    req = {
      params: {
        sessionId
      },
      body: {
        location: {
          longitude: 18.652,
          latitude: 18.652
        }
      },
      auth: { userId: user402Id }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await locationSharingSessionUserController.handlePost(req, res);

    req = {
      params: {
        sessionId
      },
      body: {},
      auth: { userId: user401Id }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await locationSharingSessionUserController.handleGet(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        users: expect.arrayContaining([
          expect.objectContaining({
            userId: user401Id,
            role: "initiator",
            location: {
              longitude: 18.652,
              latitude: 18.652
            },
            lastSeen: expect.any(Number),
            resourceRequest: expect.arrayContaining([]),
            resourceResponse: expect.arrayContaining([])
          }),
          expect.objectContaining({
            userId: user402Id,
            role: "responder",
            location: {
              longitude: 18.652,
              latitude: 18.652
            },
            lastSeen: expect.any(Number),
            resourceRequest: expect.arrayContaining([]),
            resourceResponse: expect.arrayContaining([])
          })
        ])
      })
    );
  }, 50000);

  test("Test normal request: update session storage", async () => {
    req = {
      body: {
        location: {
          longitude: 18.652,
          latitude: 18.652
        }
      },
      auth: { userId: user401Id }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(({ id }) => {
        sessionId = id;
      })
    };

    await locationSharingSessionController.handlePost(req, res);

    req = {
      params: {
        sessionId
      },
      body: {
        location: {
          longitude: 18.652,
          latitude: 18.652
        }
      },
      auth: { userId: user402Id }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await locationSharingSessionUserController.handlePost(req, res);

    req = {
      params: {
        sessionId
      },
      body: {},
      auth: { userId: user401Id }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await locationSharingSessionUserController.handleGet(req, res);

    const testData = {
      location: {
        controller: locationSharingSessionUserLocationController,
        authWrite: user401Id,
        authRead: user402Id,
        payload: {
          location: {
            longitude: 18.613,
            latitude: 18.613
          }
        }
      },
      lastSeen: {
        controller: locationSharingSessionUserLastSeenController,
        authWrite: user401Id,
        authRead: user402Id,
        payload: {
          lastSeen: 18613
        }
      },
      resourceRequest: {
        controller: locationSharingSessionUserResourceRequestController,
        authWrite: user401Id,
        authRead: user402Id,
        payload: {
          resourceRequest: ["FSE", "FCS", "FP"]
        }
      },
      resourceResponse: {
        controller: locationSharingSessionUserResourceResponseController,
        authWrite: user402Id,
        authRead: user401Id,
        payload: {
          resourceResponse: ["FSE", "FCS"]
        }
      }
    };

    for (const value of Object.values(testData)) {
      req = {
        params: {
          sessionId,
          userId: value.authWrite
        },
        body: value.payload,
        auth: { userId: value.authWrite }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await value.controller.handlePut(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({}));

      req = {
        params: {
          sessionId,
          userId: value.authWrite
        },
        body: {},
        auth: { userId: value.authRead }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await value.controller.handleGet(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining(value.payload)
      );
    }
  }, 50000);
});
