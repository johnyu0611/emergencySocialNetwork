import { ApplicationController } from "@/controller/Application.mjs";
import { HTTPError } from "@/error/HTTPError.mjs";
import { HTTP_FORBIDDEN } from "@/util/Constants.mjs";
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

const mockApplicationDAO = {
  create: jest.fn(),
  findByUsername: jest.fn(),
  deleteById: jest.fn()
};

const mockResourceDAO = {
  findById: jest.fn()
};

describe("Unit tests for ApplicationController", () => {
  let applicationController = undefined;
  let req = undefined;
  let res = undefined;

  beforeEach(() => {
    // Initialize ApplicationController with mocked dependencies
    applicationController = ApplicationController.getInstance(
      mockRouter,
      {},
      {},
      "/applications"
    );

    // Inject mocks
    applicationController.setApplicationDAO(mockApplicationDAO);
    applicationController.setResourceDAO(mockResourceDAO);

    // Mock request and response objects
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should create a new application successfully", async () => {
    req.body = {
      resourceId: "resource123",
      resourceName: "Test Resource",
      amount: 10,
      actionType: "request",
      resourceOwner: "owner123"
    };
    req.auth = { username: "applicant123" };

    const createdApplication = {
      id: "application123",
      createdAt: new Date(),
      ...req.body,
      applicantUsername: "applicant123"
    };

    mockApplicationDAO.create.mockResolvedValue(createdApplication);

    await applicationController.handlePost(req, res);

    expect(mockApplicationDAO.create).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceId: "resource123",
        resourceName: "Test Resource",
        amount: 10,
        actionType: "request",
        resourceOwner: "owner123",
        applicantUsername: "applicant123"
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: createdApplication.id,
      timestamp: createdApplication.createdAt
    });
  });

  test("Should return validation error when missing required fields in application", async () => {
    req.body = {
      resourceName: "Test Resource",
      amount: 10
    }; // Missing required fields like `resourceId`, `actionType`, etc.
    req.auth = { username: "applicant123" };

    await expect(applicationController.handlePost(req, res)).rejects.toThrow(
      "Validation failed"
    );

    expect(mockApplicationDAO.create).not.toHaveBeenCalled();
  });

  test("Should fetch applications for authenticated user", async () => {
    req.auth = { username: "applicant123" };

    const applications = [
      {
        id: "application123",
        resourceId: "resource123",
        resourceName: "Test Resource",
        amount: 10,
        actionType: "request",
        resourceOwner: "owner123",
        createdAt: new Date()
      }
    ];

    mockApplicationDAO.findByUsername.mockResolvedValue(applications);

    await applicationController.handleGet(req, res);

    expect(mockApplicationDAO.findByUsername).toHaveBeenCalledWith(
      "applicant123"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      applications,
      total: applications.length
    });
  });

  test("Should return validation error when user is not authenticated for fetching applications", async () => {
    req.auth = null;

    await expect(applicationController.handleGet(req, res)).rejects.toThrow(
      "User is not authorized to view applications"
    );

    expect(mockApplicationDAO.findByUsername).not.toHaveBeenCalled();
  });

  test("Should delete an application successfully", async () => {
    req.body = { id: "application123" };
    req.auth = { username: "applicant123" };

    mockApplicationDAO.deleteById.mockResolvedValue(true);

    await applicationController.handleDelete(req, res);

    expect(mockApplicationDAO.deleteById).toHaveBeenCalledWith(
      "application123"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Application successfully deleted"
    });
  });

  test("Should return not found error when trying to delete a non-existent application", async () => {
    req.body = { id: "application123" };
    req.auth = { username: "applicant123" };

    // Mock DAO to return false for non-existent application
    mockApplicationDAO.deleteById.mockResolvedValue(false);

    await expect(applicationController.handleDelete(req, res)).rejects.toThrow(
      "Application not found"
    );

    expect(mockApplicationDAO.deleteById).toHaveBeenCalledWith(
      "application123"
    );
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  test("Should return unauthorized error when creating application without authentication", async () => {
    req.body = {
      resourceId: "resource123",
      resourceName: "Test Resource",
      amount: 10,
      actionType: "request",
      resourceOwner: "owner123"
    };
    req.auth = null; // No authentication

    await expect(applicationController.handlePost(req, res)).rejects.toThrow(
      "User is not authorized to perform this action"
    );

    expect(mockApplicationDAO.create).not.toHaveBeenCalled();
  });

  test("Should return not found error when deleting application with non-existent ID", async () => {
    req.body = { id: "nonexistent-id" }; // Any ID that doesn't exist
    req.auth = { username: "applicant123" };

    // Mock DAO to return false when application doesn't exist
    mockApplicationDAO.deleteById.mockResolvedValue(false);

    await expect(applicationController.handleDelete(req, res)).rejects.toThrow(
      "Application not found"
    );

    expect(mockApplicationDAO.deleteById).toHaveBeenCalledWith(
      "nonexistent-id"
    );
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  test("Should return forbidden error when user tries to delete an application they don't own", async () => {
    req.body = { id: "application123" };
    req.auth = { username: "userNotOwner" }; // Different user

    // Mock DAO to return an application owned by another user
    mockApplicationDAO.deleteById.mockImplementation((id) => {
      if (id === "application123") {
        // Simulate application exists but owned by someone else
        throw new HTTPError(
          HTTP_FORBIDDEN,
          "User is not authorized to delete this application"
        );
      }
      return false;
    });

    await expect(applicationController.handleDelete(req, res)).rejects.toThrow(
      "User is not authorized to delete this application"
    );

    expect(mockApplicationDAO.deleteById).toHaveBeenCalledWith(
      "application123"
    );
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  test("Should return forbidden error when user tries to delete an application they don't own", async () => {
    req.body = { id: "application123" };
    req.auth = { username: "userNotOwner" }; // Different user

    // Mock DAO to return an application owned by another user
    mockApplicationDAO.deleteById.mockImplementation((id) => {
      if (id === "application123") {
        // Simulate application exists but owned by someone else
        throw new HTTPError(
          HTTP_FORBIDDEN,
          "User is not authorized to delete this application"
        );
      }
      return false;
    });

    await expect(applicationController.handleDelete(req, res)).rejects.toThrow(
      "User is not authorized to delete this application"
    );

    expect(mockApplicationDAO.deleteById).toHaveBeenCalledWith(
      "application123"
    );
    expect(res.status).not.toHaveBeenCalledWith(200);
  });
});
