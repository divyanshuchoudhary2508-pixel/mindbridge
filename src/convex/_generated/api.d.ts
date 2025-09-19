/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai from "../ai.js";
import type * as assessments from "../assessments.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as chatbot from "../chatbot.js";
import type * as emergency from "../emergency.js";
import type * as http from "../http.js";
import type * as resources from "../resources.js";
import type * as reviews from "../reviews.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  assessments: typeof assessments;
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  chatbot: typeof chatbot;
  emergency: typeof emergency;
  http: typeof http;
  resources: typeof resources;
  reviews: typeof reviews;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
