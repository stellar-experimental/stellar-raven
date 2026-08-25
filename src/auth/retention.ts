/**
 * Every retention duration the Service discloses, in one place.
 *
 * Privacy disclosures quote these durations. The Terms state the outer bound
 * of what the Service MAY do; a disclosure of current practice has to match
 * what the runtime actually enforces, and a number copied by hand drifts the
 * first time a TTL moves. This module is the single value every disclosure
 * quotes. Four runtime constants read it; the other three are checked against
 * it by a test. The split is spelled out below, because which durations are
 * enforced by construction and which are only guarded is the whole point.
 *
 * Leaf module: it imports nothing, so any layer can read it without a cycle.
 *
 * Four constants derive FROM this leaf and cannot drift by construction:
 *   - accessTokenSeconds        → ACCESS_TOKEN_TTL_SECONDS        (src/auth/gate.ts)
 *   - refreshGrantSeconds       → REFRESH_TOKEN_TTL_SECONDS       (src/auth/gate.ts)
 *   - clientRegistrationSeconds → CLIENT_REGISTRATION_TTL_SECONDS (src/auth/gate.ts)
 *   - demoThrottleSeconds       → THROTTLE_TTL_SECONDS            (src/demo/budget.ts)
 *
 * Three remain independent literals at their own call sites, because their
 * modules own semantics this leaf should not import. This leaf only MIRRORS
 * them, and test/retention.test.ts compares each against the live constant, so
 * a drift fails the build instead of shipping a wrong published number:
 *   - loginStateSeconds         → LOGIN_STATE_TTL_SECONDS         (src/auth/workos.ts)
 *   - demoCookieSeconds         → DEMO_COOKIE_TTL_SECONDS         (src/demo/auth.ts)
 *   - artifactSeconds           → ARTIFACT_TTL_MS                 (src/artifacts/store.ts)
 *
 * Cloudflare platform retention (request metadata, Workers Logs, trace spans)
 * is set by Cloudflare, not here, and is disclosed separately.
 */
export const RETENTION = {
  /** OAuth access tokens issued by Raven. */
  accessTokenSeconds: 60 * 60,
  /** Refresh grants within the fixed re-authentication window. */
  refreshGrantSeconds: 90 * 24 * 60 * 60,
  /** Dynamically registered OAuth clients. */
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
