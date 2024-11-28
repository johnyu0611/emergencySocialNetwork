import { z } from "zod";

/**
 * `POST /api/applications`
 *
 * Request payload schema
 */
export const PostApplicationRequestSchema = z.object({
  id: z.string(), // Unique ID of the application
  resourceId: z.string().min(1, "Resource ID is required"), // ID of the associated resource
  resourceName: z.string().min(1, "Resource name is required"), // Resource name involved in the application
  amount: z.number().min(1, "Amount must be at least 1"), // Amount to request/provide
  actionType: z.enum(["provide", "request"]), // Action type: "provide" or "request"
  applicantUsername: z.string().min(1, "Applicant username is required"), // Username of the applicant
  resourceOwner: z.string().min(1, "Resource owner is required"), // Username of the resource owner
  createdAt: z.date() // Timestamp of application creation
});

/**
 * `POST /api/applications`
 *
 * Response payload schema
 */
export const PostApplicationResponseSchema = z.object({
  id: z.string(), // Unique ID of the application
  resourceId: z.string(), // ID of the associated resource
  timestamp: z.date() // Timestamp of when the application was created
});

/**
 * `GET /api/applications`
 *
 * Response payload schema
 */
export const GetApplicationsResponseSchema = z.object({
  applications: z.array(
    z.object({
      id: z.string(), // Unique ID of the application
      resourceId: z.string(), // ID of the associated resource
      resourceName: z.string(), // Resource name involved in the application
      amount: z.number(), // Amount requested/provided
      actionType: z.enum(["provide", "request"]), // Action type
      applicantUsername: z.string(), // Username of the applicant
      resourceOwner: z.string(), // Username of the resource owner
      createdAt: z.date() // Timestamp of application creation
    })
  ),
  total: z.number() // Total number of applications
});

/**
 * `DELETE /api/applications`
 *
 * Request payload schema
 */
export const DeleteApplicationRequestSchema = z.object({
  id: z.string().min(1, "Application ID is required") // Unique ID of the application
});
