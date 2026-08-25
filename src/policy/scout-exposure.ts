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
  // The 1.8.87 response leaves subject/current/evidence as opaque objects and
  // omits the live meta envelope. Expose it after the upstream contract names
  // the identity and provenance fields a model must project.
  "GET /api/projects/resolve"
]);

export const EXCLUDED_SCOUT_PATHS = new Set(
  [...EXCLUDED_SCOUT_OPS].map((operation) => operation.split(" ")[1]!)
);
