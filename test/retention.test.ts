/**
 * Binds src/auth/retention.ts to the runtime constants it represents.
 *
 * Four of the seven durations derive FROM the leaf, so those assertions are
 * structural. The other three are independent literals the leaf only mirrors;
 * for those this file is the only thing standing between a moved TTL and a
 * published retention figure that is no longer true.
 */
import { describe, expect, it } from "vitest";
import { RETENTION } from "../src/auth/retention";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  CLIENT_REGISTRATION_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS
} from "../src/auth/gate";
import { LOGIN_STATE_TTL_SECONDS } from "../src/auth/workos";
import { DEMO_COOKIE_TTL_SECONDS } from "../src/demo/auth";
import { THROTTLE_TTL_SECONDS } from "../src/demo/budget";
import { ARTIFACT_TTL_MS } from "../src/artifacts/store";

describe("RETENTION leaf", () => {
  it("is the source for the constants that derive from it", () => {
    expect(ACCESS_TOKEN_TTL_SECONDS).toBe(RETENTION.accessTokenSeconds);
    expect(REFRESH_TOKEN_TTL_SECONDS).toBe(RETENTION.refreshGrantSeconds);
    expect(CLIENT_REGISTRATION_TTL_SECONDS).toBe(RETENTION.clientRegistrationSeconds);
    expect(THROTTLE_TTL_SECONDS).toBe(RETENTION.demoThrottleSeconds);
  });

  it("mirrors the constants it cannot import without owning their semantics", () => {
    expect(RETENTION.loginStateSeconds).toBe(LOGIN_STATE_TTL_SECONDS);
    expect(RETENTION.demoCookieSeconds).toBe(DEMO_COOKIE_TTL_SECONDS);
    expect(RETENTION.artifactSeconds).toBe(ARTIFACT_TTL_MS / 1000);
  });

  it("keeps every duration a whole number of seconds", () => {
    for (const [name, seconds] of Object.entries(RETENTION)) {
      expect(Number.isInteger(seconds), `${name} must be whole seconds`).toBe(true);
      expect(seconds, `${name} must be positive`).toBeGreaterThan(0);
    }
  });
});
