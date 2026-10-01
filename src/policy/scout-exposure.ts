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
  // Keep quality excluded until its routing contract and a general scoring
  // repair pass the routing gates and independent exposure review.
  "GET /api/quality",
  // Keep verification excluded until a routing-contract candidate passes
  // the routing gates and independent exposure review.
  "GET /api/verify",
  // RWA routing can capture unrelated implementation queries. Require a
  // general routing repair and independent operation review before exposure.
  "GET /api/rwa"
]);

// Public skill prose also describes this collection, but Scout's OpenAPI does
// not list it. The catalog builder checks that absence so a future addition
// requires a new exposure decision instead of silently changing this policy.
export const SCOUT_PATHS_ABSENT_FROM_SPEC = new Set(["/api/repos"]);

export const EXCLUDED_SCOUT_PATHS = new Set([
  ...[...EXCLUDED_SCOUT_OPS].map((operation) => operation.split(" ")[1]!),
  ...SCOUT_PATHS_ABSENT_FROM_SPEC
]);
