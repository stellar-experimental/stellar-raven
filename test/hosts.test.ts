import { describe, expect, it } from "vitest";
import { ALIAS_HOSTNAMES, canonicalHostRedirect } from "../src/hosts";
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
