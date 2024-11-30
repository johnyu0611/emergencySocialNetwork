import { config } from "@/config/Config.mjs";
import { ChatroomController } from "@/controller/Chatroom.mjs";
import { ChatroomIdController } from "@/controller/ChatroomId.mjs";
import { ChatroomMessageController } from "@/controller/ChatroomMessage.mjs";
import { ChatroomMessageIdController } from "@/controller/ChatroomMessageId.mjs";
import { TestController } from "@/controller/SystemState.mjs";
import { TokenController } from "@/controller/Token.mjs";
import { UserController } from "@/controller/User.mjs";
import { StatusController } from "@/controller/Status.mjs";
import { StatusHistoryController } from "@/controller/StatusHistory.mjs";
import { EmergencyContactController } from "@/controller/EmergencyContact.mjs";
import { EmergencyHistoryController } from "@/controller/EmergencyHistory.mjs";
import { QuizController } from "@/controller/Quiz.mjs";
import { QuizQuestionController } from "@/controller/QuizQuestion.mjs";
import { QuizChallengeController } from "@/controller/QuizChallenge.mjs";
import { logger } from "@/log/Logger.mjs";
import { auth } from "@/middleware/Auth.mjs";
import { checkSystemStatus } from "@/middleware/CheckSystemStatus.mjs";
import { getWithBody } from "@/middleware/GetWithBody.mjs";
import { json, Router } from "express";
import { UserLocationSharingSessionController } from "@/controller/UserLocationSharingSession.mjs";
import { LocationSharingSessionController } from "@/controller/LocationSharingSession.mjs";
import { LocationSharingSessionIdController } from "@/controller/LocationSharingSessionId.mjs";
import { LocationSharingSessionUserController } from "@/controller/LocationSharingSessionUser.mjs";
import { LocationSharingSessionUserLastSeenController } from "@/controller/LocationSharingSessionUserLastSeen.mjs";
import { LocationSharingSessionUserLocationController } from "@/controller/LocationSharingSessionUserLocation.mjs";
import { LocationSharingSessionUserResourceRequestController } from "@/controller/LocationSharingSessionUserResourceRequest.mjs";
import { LocationSharingSessionUserResourceResponseController } from "@/controller/LocationSharingSessionUserResourceResponse.mjs";
import { LocationSharingSessionUserRoleController } from "@/controller/LocationSharingSessionUserRole.mjs";
import { ResourceController } from "@/controller/PostResource.mjs";
import { ApplicationController } from "@/controller/Application.mjs";
import { MedicalCenterController } from "@/controller/MedicalCenter.mjs";
import { ReviewController } from "@/controller/Review.mjs";
import { UserUsernameController } from "@/controller/UserUsername.mjs";

const loggerContext = "RouteRegistrar";

export function registerRoutes(context) {
  const { app, jwt } = context;
  const router = Router({ mergeParams: true });

  const jsonMiddleware = json();
  const getWithBodyMiddleware = getWithBody();
  const authMiddleware = auth(jwt);

  // Added for speed test
  const testMiddleware = checkSystemStatus();

  UserController.getInstance(router, context, {
    all: [jsonMiddleware, testMiddleware],
    get: [authMiddleware, getWithBodyMiddleware]
  });
  UserUsernameController.getInstance(
    UserController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );
  UserLocationSharingSessionController.getInstance(
    UserController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );
  TokenController.getInstance(router, context, {
    all: [jsonMiddleware, testMiddleware],
    delete: [authMiddleware]
  });
  ChatroomController.getInstance(router, context, {
    all: [authMiddleware, jsonMiddleware],
    get: [getWithBodyMiddleware]
  });
  ChatroomIdController.getInstance(
    ChatroomController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );
  ChatroomMessageController.getInstance(
    ChatroomIdController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );
  ChatroomMessageIdController.getInstance(
    ChatroomMessageController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );
  TestController.getInstance(router, context, {
    all: [authMiddleware, jsonMiddleware],
    put: []
  });
  StatusController.getInstance(router, context, {
    all: [authMiddleware, jsonMiddleware]
  });
  StatusHistoryController.getInstance(router, context, {
    all: [authMiddleware, jsonMiddleware],
    get: [getWithBodyMiddleware]
  });

  LocationSharingSessionController.getInstance(router, context, {
    all: [authMiddleware, jsonMiddleware],
    get: [getWithBodyMiddleware]
  });
  LocationSharingSessionIdController.getInstance(
    LocationSharingSessionController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );
  LocationSharingSessionUserController.getInstance(
    LocationSharingSessionIdController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );
  LocationSharingSessionUserLastSeenController.getInstance(
    LocationSharingSessionUserController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );
  LocationSharingSessionUserLocationController.getInstance(
    LocationSharingSessionUserController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );
  LocationSharingSessionUserResourceRequestController.getInstance(
    LocationSharingSessionUserController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );
  LocationSharingSessionUserResourceResponseController.getInstance(
    LocationSharingSessionUserController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );
  LocationSharingSessionUserRoleController.getInstance(
    LocationSharingSessionUserController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );
  ResourceController.getInstance(router, context, {
    all: [authMiddleware, jsonMiddleware],
    get: [getWithBodyMiddleware]
  });
  ApplicationController.getInstance(router, context, {
    all: [authMiddleware, jsonMiddleware],
    get: [getWithBodyMiddleware]
  });
  EmergencyContactController.getInstance(router, context, {
    all: [authMiddleware, jsonMiddleware],
    get: [getWithBodyMiddleware]
  });
  EmergencyHistoryController.getInstance(router, context, {
    all: [authMiddleware, jsonMiddleware],
    get: [getWithBodyMiddleware]
  });
  QuizController.getInstance(router, context, {
    all: [authMiddleware, jsonMiddleware],
    post: []
  });
  QuizChallengeController.getInstance(
    QuizController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      post: []
    }
  );
  QuizQuestionController.getInstance(
    QuizController.getInstance().router,
    context,
    {
      all: [authMiddleware, jsonMiddleware],
      get: [getWithBodyMiddleware]
    }
  );

  MedicalCenterController.getInstance(router, context, {
    all: [authMiddleware, jsonMiddleware],
    get: [getWithBodyMiddleware]
  });

  ReviewController.getInstance(router, context, {
    all: [authMiddleware, jsonMiddleware],
    get: [getWithBodyMiddleware]
  });

  app.use(`${config.server.apiBasePath}`, router);
  logger.debug(
    { context: loggerContext },
    `Root router mounted at ${config.server.apiBasePath}`
  );
}
