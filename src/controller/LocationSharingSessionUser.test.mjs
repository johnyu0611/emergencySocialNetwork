import { describe, expect, test } from "@jest/globals";
import {
  GetRequestSchema,
  GetResponseSchema,
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/LocationSharingSessionUser.mjs";

describe("Unit tests for LocationSharingSessionUser", () => {
  test("Validates an empty object", () => {
    expect(GetRequestSchema.safeParse({}).success).toBe(true);
  });

  test("Validates a response with valid users", () => {
    const validResponse = {
      users: [
        {
          username: "user123",
          role: "initiator",
          location: { longitude: 123.456, latitude: 78.9 },
          lastSeen: 1623456789,
          resourceRequest: ["resource1", "resource2"],
          resourceResponse: ["resource3"]
        }
      ]
    };
    expect(GetResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  test("Rejects a response with an invalid user role", () => {
    const invalidResponse = {
      users: [
        {
          username: "user123",
          role: "unknown", // Invalid role
          location: { longitude: 123.456, latitude: 78.9 },
          lastSeen: 1623456789,
          resourceRequest: ["resource1"],
          resourceResponse: ["resource2"]
        }
      ]
    };
    expect(GetResponseSchema.safeParse(invalidResponse).success).toBe(false);
  });

  test("Rejects a response with invalid location data", () => {
    const invalidResponse = {
      users: [
        {
          username: "user123",
          role: "initiator",
          location: { longitude: "123.456", latitude: 78.9 }, // Invalid longitude
          lastSeen: 1623456789,
          resourceRequest: ["resource1"],
          resourceResponse: ["resource2"]
        }
      ]
    };
    expect(GetResponseSchema.safeParse(invalidResponse).success).toBe(false);
  });

  test("Validates a correct PostRequestSchema object", () => {
    const validRequest = {
      location: { longitude: 123.456, latitude: 78.9 }
    };
    expect(PostRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  test("Rejects an incorrect PostRequestSchema object", () => {
    const invalidRequest = {
      location: { longitude: "123.456", latitude: 78.9 } // Invalid longitude type
    };
    expect(PostRequestSchema.safeParse(invalidRequest).success).toBe(false);
  });

  test("Rejects missing location field", () => {
    expect(PostRequestSchema.safeParse({}).success).toBe(false);
  });

  test("Validates an empty object", () => {
    expect(PostResponseSchema.safeParse({}).success).toBe(true);
  });
});
