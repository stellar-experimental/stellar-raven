/**
 * Single source of truth for disclosed retention durations. Leaf module (no imports).
 * Four constants import this directly (`accessTokenSeconds`, `refreshGrantSeconds`,
 * `clientRegistrationSeconds`, `demoThrottleSeconds`); the other three mirror literals
 * owned by their modules and are pinned equal by test/retention.test.ts.
 */
export const RETENTION = {
  /** OAuth access tokens issued by Raven. */
  accessTokenSeconds: 60 * 60,
  /** Refresh grants within the fixed re-authentication window. */
  refreshGrantSeconds: 90 * 24 * 60 * 60,
  /**
   * Dynamically registered OAuth clients. The provider rewrites a registration
   * for another full lifetime when a token request arrives in its second half,
   * so a registration in use does not expire; an idle one lapses after this long.
   */
  clientRegistrationSeconds: 365 * 24 * 60 * 60,
  /** Parked /authorize login states in OAUTH_KV. */
  loginStateSeconds: 10 * 60,
  /** Signed playground session cookies. */
  demoCookieSeconds: 2 * 60 * 60,
  /** Playground per-subject rate-limit buckets in KV. */
  demoThrottleSeconds: 2 * 60 * 60,
  /** Oversized secret-redacted execute artifacts in R2. */
  artifactSeconds: 7 * 24 * 60 * 60
} as const;

/** Usage records retain the current UTC month and twelve complete months. */
export const USAGE_RETENTION_MONTHS = 13;
