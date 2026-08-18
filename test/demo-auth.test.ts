/**
 * Unit tests for the demo-playground session cookie (src/demo/auth.ts):
 * mint→verify roundtrip, tamper/expiry rejection, and the parked-state
 * demo-branch validator (fixed same-origin paths only).
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEMO_COOKIE_NAME,
  DEMO_COOKIE_TTL_SECONDS,
  mintDemoCookie,
  parseDemoParkedState,
  verifyDemoCookie
} from "../src/demo/auth";

const SECRET = "test-demo-secret";
const SUBJECT = "a".repeat(64); // deriveSubject output shape: 64 hex chars

/** The `name=value` pair from a full Set-Cookie string, as a browser would send it back. */
function cookiePair(setCookie: string): string {
  return setCookie.split(";")[0]!;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("mintDemoCookie", () => {
  it("emits the __Host- attribute set the contract requires", async () => {
    const setCookie = await mintDemoCookie(SECRET, SUBJECT);
    expect(setCookie.startsWith(`${DEMO_COOKIE_NAME}=`)).toBe(true);
    expect(setCookie).toContain("Path=/");
    expect(setCookie).toContain("Secure");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Strict");
    expect(setCookie).toContain(`Max-Age=${DEMO_COOKIE_TTL_SECONDS}`);
    expect(setCookie).not.toContain("Domain=");
  });

  it("value is <base64url payload>.<base64url mac> with a {sub,iat,exp} payload", async () => {
    const value = cookiePair(await mintDemoCookie(SECRET, SUBJECT)).split("=")[1]!;
    const [payload, mac, extra] = value.split(".");
    expect(extra).toBeUndefined();
    expect(mac).toMatch(/^[A-Za-z0-9_-]+$/);
    const decoded = JSON.parse(Buffer.from(payload!, "base64url").toString("utf8"));
    expect(decoded.sub).toBe(SUBJECT);
    expect(decoded.exp - decoded.iat).toBe(DEMO_COOKIE_TTL_SECONDS);
  });

  it("fails loudly on an unset secret", async () => {
    await expect(mintDemoCookie("", SUBJECT)).rejects.toThrow(/MCP_SERVER_SECRET/);
  });
});

describe("verifyDemoCookie", () => {
  it("roundtrips: verify(mint) returns the subject", async () => {
    const cookieHeader = cookiePair(await mintDemoCookie(SECRET, SUBJECT));
    expect(await verifyDemoCookie(SECRET, cookieHeader)).toBe(SUBJECT);
  });

  it("finds the demo cookie among other cookies", async () => {
    const pair = cookiePair(await mintDemoCookie(SECRET, SUBJECT));
    expect(await verifyDemoCookie(SECRET, `other=1; ${pair}; last=2`)).toBe(SUBJECT);
  });

  it("rejects a missing header and an absent cookie", async () => {
    expect(await verifyDemoCookie(SECRET, null)).toBeNull();
    expect(await verifyDemoCookie(SECRET, "other=1")).toBeNull();
  });

  it("rejects a tampered payload (mac no longer matches)", async () => {
    const pair = cookiePair(await mintDemoCookie(SECRET, SUBJECT));
    const [name, value] = pair.split("=") as [string, string];
    const [payload, mac] = value.split(".") as [string, string];
    const forged = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    forged.sub = "b".repeat(64);
    const forgedPayload = Buffer.from(JSON.stringify(forged)).toString("base64url");
    expect(await verifyDemoCookie(SECRET, `${name}=${forgedPayload}.${mac}`)).toBeNull();
  });

  it("rejects a tampered mac and a wrong-key mac", async () => {
    const pair = cookiePair(await mintDemoCookie(SECRET, SUBJECT));
    const flipped = pair.slice(0, -1) + (pair.endsWith("A") ? "B" : "A");
    expect(await verifyDemoCookie(SECRET, flipped)).toBeNull();
    const otherKey = cookiePair(await mintDemoCookie("other-secret", SUBJECT));
    expect(await verifyDemoCookie(SECRET, otherKey)).toBeNull();
  });

  it("rejects malformed values without throwing", async () => {
    for (const bad of [
      `${DEMO_COOKIE_NAME}=`,
      `${DEMO_COOKIE_NAME}=noseparator`,
      `${DEMO_COOKIE_NAME}=a.b.c`,
      `${DEMO_COOKIE_NAME}=!!!.???`,
      `${DEMO_COOKIE_NAME}=${Buffer.from("not json").toString("base64url")}.AAAA`
    ]) {
      expect(await verifyDemoCookie(SECRET, bad)).toBeNull();
    }
  });

  it("rejects an expired cookie", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-06T00:00:00Z"));
    const pair = cookiePair(await mintDemoCookie(SECRET, SUBJECT));
    vi.setSystemTime(new Date("2026-07-06T00:00:00Z").getTime() + (DEMO_COOKIE_TTL_SECONDS + 1) * 1000);
    expect(await verifyDemoCookie(SECRET, pair)).toBeNull();
  });

  it("still accepts just before expiry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-06T00:00:00Z"));
    const pair = cookiePair(await mintDemoCookie(SECRET, SUBJECT));
    vi.setSystemTime(new Date("2026-07-06T00:00:00Z").getTime() + (DEMO_COOKIE_TTL_SECONDS - 5) * 1000);
    expect(await verifyDemoCookie(SECRET, pair)).toBe(SUBJECT);
  });
});

describe("parseDemoParkedState", () => {
  it("accepts the two fixed returnTo paths", () => {
    expect(parseDemoParkedState(JSON.stringify({ type: "demo", returnTo: "/playground", binding: "x" }))).toEqual({
      type: "demo",
      returnTo: "/playground"
    });
    expect(parseDemoParkedState(JSON.stringify({ type: "demo", returnTo: "/playground/" }))).toEqual({
      type: "demo",
      returnTo: "/playground/"
    });
  });

  it("rejects non-demo, open-redirect, and malformed states", () => {
    expect(parseDemoParkedState(JSON.stringify({ type: "mcp", oauthReq: {}, binding: "x" }))).toBeNull();
    expect(parseDemoParkedState(JSON.stringify({ type: "demo", returnTo: "https://evil.example/demo" }))).toBeNull();
    expect(parseDemoParkedState(JSON.stringify({ type: "demo", returnTo: "/playground/../mcp" }))).toBeNull();
    expect(parseDemoParkedState(JSON.stringify({ type: "demo", returnTo: "//evil.example" }))).toBeNull();
    expect(parseDemoParkedState(JSON.stringify({ type: "demo" }))).toBeNull();
    expect(parseDemoParkedState(JSON.stringify({ returnTo: "/demo" }))).toBeNull();
    expect(parseDemoParkedState(JSON.stringify("demo"))).toBeNull();
    expect(parseDemoParkedState(JSON.stringify(null))).toBeNull();
    expect(parseDemoParkedState("not json {")).toBeNull();
  });
});
