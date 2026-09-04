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
  // The accepted 1.9.1 surface keeps this excluded. Upstream 1.9.13 narrowed
  // x-routing, but candidate response-schema keywords caused 90 unrelated
  // captures. Expose it after a general scoring repair passes routing review.
  "GET /api/quality",
  // The accepted 1.9.1 surface keeps this excluded by a separate routing
  // decision. Upstream 1.9.13 completed the issued response enum. Expose it
  // only with an accepted current-surface routing review.
  "GET /api/verify"
]);

export const EXCLUDED_SCOUT_PATHS = new Set(
  [...EXCLUDED_SCOUT_OPS].map((operation) => operation.split(" ")[1]!)
);
