import { describe, expect, test } from "@jest/globals";
import {
  LocationSchema,
  LocationSharingLastSeenSchema,
  LocationSharingResourceListSchema,
  LocationSharingRoleSchema,
  LocationSharingSessionIdSchema
} from "@/controller/schema/Common.mjs";
import {
  PostRequestSchema,
  PostResponseSchema
} from "@/controller/schema/LocationSharingSession.mjs";

describe("Unit tests for common schemas and schema for LocationSharingSessionUser", () => {
  test("Validates LocationSharingSessionIdSchema correctly", () => {
    expect(LocationSharingSessionIdSchema.safeParse("undefined").success).toBe(
      true
    );
    expect(
      LocationSharingSessionIdSchema.safeParse(
        "b3f3f884-3bfc-4d3c-aee9-1e5e8fdf46f4"
      ).success
    ).toBe(true);
    expect(
      LocationSharingSessionIdSchema.safeParse("invalid-uuid").success
    ).toBe(false);
    expect(LocationSharingSessionIdSchema.safeParse(123).success).toBe(false);
  });

  test("Validates LocationSharingRoleSchema correctly", () => {
    expect(LocationSharingRoleSchema.safeParse("initiator").success).toBe(true);
    expect(LocationSharingRoleSchema.safeParse("responder").success).toBe(true);
    expect(LocationSharingRoleSchema.safeParse("undefined").success).toBe(true);
    expect(LocationSharingRoleSchema.safeParse("other").success).toBe(false);
  });

  test("Validates LocationSharingLastSeenSchema correctly", () => {
    expect(LocationSharingLastSeenSchema.safeParse(123).success).toBe(true);
    expect(LocationSharingLastSeenSchema.safeParse(0).success).toBe(true);
    expect(
      LocationSharingLastSeenSchema.safeParse("not-a-number").success
    ).toBe(false);
    expect(LocationSharingLastSeenSchema.safeParse(null).success).toBe(false);
  });

  test("Validates LocationSharingResourceListSchema correctly", () => {
    expect(
      LocationSharingResourceListSchema.safeParse(["resource1", "resource2"])
        .success
    ).toBe(true);
    expect(LocationSharingResourceListSchema.safeParse([""]).success).toBe(
      false
    );
    expect(LocationSharingResourceListSchema.safeParse([]).success).toBe(true);
    expect(
      LocationSharingResourceListSchema.safeParse("resource1").success
    ).toBe(false);
  });

  test("Validates LocationSchema correctly", () => {
    expect(
      LocationSchema.safeParse({ longitude: 123.456, latitude: 78.9 }).success
    ).toBe(true);
    expect(
      LocationSchema.safeParse({ longitude: "123.456", latitude: 78.9 }).success
    ).toBe(false);
    expect(LocationSchema.safeParse({ latitude: 78.9 }).success).toBe(false);
    expect(LocationSchema.safeParse(null).success).toBe(false);
  });

  test("Validates PostRequestSchema correctly", () => {
    expect(
      PostRequestSchema.safeParse({
        location: { longitude: 123.456, latitude: 78.9 }
      }).success
    ).toBe(true);
    expect(
      PostRequestSchema.safeParse({
        location: { longitude: "123.456", latitude: 78.9 }
      }).success
    ).toBe(false);
    expect(PostRequestSchema.safeParse({}).success).toBe(false);
    expect(PostRequestSchema.safeParse(null).success).toBe(false);
  });

  test("Validates PostResponseSchema correctly", () => {
    expect(
      PostResponseSchema.safeParse({
        id: "b3f3f884-3bfc-4d3c-aee9-1e5e8fdf46f4"
      }).success
    ).toBe(true);
    expect(PostResponseSchema.safeParse({ id: "undefined" }).success).toBe(
      true
    );
    expect(PostResponseSchema.safeParse({ id: "invalid-uuid" }).success).toBe(
      false
    );
    expect(PostResponseSchema.safeParse({}).success).toBe(false);
  });
});
