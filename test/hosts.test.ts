import { describe, expect, it } from "vitest";
import {
  ALIAS_HOSTNAMES,
  PRODUCTION_ORIGINS,
  canonicalHostRedirect,
  selectOAuthOrigin
} from "../src/hosts";
import { HOST } from "../src/site";

describe("canonicalHostRedirect", () => {
  it("never redirects the canonical host or an unknown host", () => {
    expect(canonicalHostRedirect(new URL(`https://${HOST}/`))).toBeNull();
    expect(canonicalHostRedirect(new URL("http://localhost:8787/"))).toBeNull();
    expect(canonicalHostRedirect(new URL("https://evil.example/"))).toBeNull();
  });

  it("sends alias pages to the same path and query on the canonical host", () => {
    for (const alias of ALIAS_HOSTNAMES) {
      const res = canonicalHostRedirect(new URL(`https://${alias.toUpperCase()}/docs?a=1&b=2`));
      expect(res?.status).toBe(308);
      expect(res?.headers.get("location")).toBe(`https://${HOST}/docs?a=1&b=2`);
    }
  });

  it("serves MCP, OAuth, and discovery on the configured alias origin", () => {
    for (const path of [
      "/mcp",
      "/mcp/",
      "/mcp/nested",
      "/authorize",
      "/callback?code=x&state=y",
      "/token",
      "/register",
      "/.well-known/oauth-authorization-server",
      "/.well-known/oauth-authorization-server/mcp",
      "/.well-known/oauth-protected-resource",
      "/.well-known/oauth-protected-resource/mcp",
      "/.well-known/openid-configuration",
      "/.well-known/openid-configuration/mcp"
    ]) {
      for (const alias of ALIAS_HOSTNAMES) {
        const response = canonicalHostRedirect(new URL(`https://${alias}${path}`));
        expect(response, path).toBeNull();
      }
    }
  });

  it("keeps a double-slash path on the canonical host", () => {
    for (const alias of ALIAS_HOSTNAMES) {
      const response = canonicalHostRedirect(new URL(`https://${alias}//evil.example/mcp?x=1`));
      expect(response?.status).toBe(308);
      expect(response?.headers.get("location")).toBe(`https://${HOST}//evil.example/mcp?x=1`);
    }
  });

  it("redirects lookalikes outside the served namespaces", () => {
    for (const path of ["/mcpx", "/authorized", "/tokens", "/callbacks", "/registers", "/.well-knownx/oauth-authorization-server"]) {
      expect(canonicalHostRedirect(new URL(`https://agents.stellar.buzz${path}`))?.status, path).toBe(308);
    }
  });
});

describe("selectOAuthOrigin", () => {
  // Independent of hosts.ts: dropping an origin must fail these tests.
  const production = ["https://raven.stellar.org", "https://raven.stellar.buzz", "https://agents.stellar.buzz"];

  it("lists exactly the three production origins, derived from one host source", () => {
    expect([...PRODUCTION_ORIGINS]).toEqual(production);
  });

  it.each(production)("selects the production origin %s, from any path", (origin) => {
    for (const path of ["/", "/mcp", "/authorize?x=1", "/.well-known/oauth-protected-resource/mcp", "/playground/login"]) {
      expect(selectOAuthOrigin(new URL(`${origin}${path}`)), path).toBe(origin);
    }
    expect(selectOAuthOrigin(new URL(origin.toUpperCase().replace("HTTPS", "https")))).toBe(origin);
  });

  it.each([
    ["http://localhost:8787/mcp", "http://localhost:8787"],
    ["http://localhost/mcp", "http://localhost"],
    ["http://127.0.0.1:8787/", "http://127.0.0.1:8787"],
    ["http://[::1]:8787/", "http://[::1]:8787"]
  ])("selects the loopback origin for %s", (url, origin) => {
    expect(selectOAuthOrigin(new URL(url))).toBe(origin);
  });

  it.each([
    "https://unknown.example/mcp",
    "http://raven.stellar.org/mcp",
    "https://raven.stellar.org:8443/mcp",
    "https://raven.stellar.org.evil.example/mcp",
    "https://evil.example/raven.stellar.org",
    "https://localhost:8787/mcp",
    "http://127.0.0.2:8787/mcp",
    "http://192.168.1.5:8787/mcp",
    "http://0.0.0.0:8787/mcp",
    "ws://localhost:8787/mcp",
    "http://localhost.evil.example/mcp"
  ])("selects nothing for %s", (url) => {
    expect(selectOAuthOrigin(new URL(url))).toBeNull();
  });
});
