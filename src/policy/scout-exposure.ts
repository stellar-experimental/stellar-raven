/**
 * Scout operations that Raven does not expose.
 *
 * This module is the single source for both build-time filtering and runtime
 * skill-body filtering. Keep the method with the path because operation
 * exposure is method-specific. Skill prose filtering derives its path set
 * from these records.
 */
export const EXCLUDED_SCOUT_OPS = new Set([
  "POST /api/feedback",
  "GET /api/feedback",
  "POST /api/partners/submit-listing",
  "POST /api/partners/assistant",
  "POST /api/partners/onboard",
  // OpenAPI 1.9.1 still gives this self-report broad confidence, coverage, and
  // source vocabulary. It captures unrelated queries throughout the routing
  // corpus. Expose it after the routing contract becomes selective.
  "GET /api/quality",
  // OpenAPI 1.9.1 still accepts and returns claim.type "issued", but the 200
  // response schema omits it from the claim.type enum. Expose the operation
  // after one shared claim-type contract covers both request and response.
  "GET /api/verify"
]);

export const EXCLUDED_SCOUT_PATHS = new Set(
  [...EXCLUDED_SCOUT_OPS].map((operation) => operation.split(" ")[1]!)
);
