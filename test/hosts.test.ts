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

  it("redirects MCP, OAuth, and well-known paths to the canonical host", () => {
    for (const path of [
      "/mcp",
      "/mcp/",
      "/authorize",
      "/callback?code=x&state=y",
      "/token",
      "/register",
      "/.well-known/oauth-authorization-server",
      "/.well-known/oauth-protected-resource/mcp",
      "/.well-known/openid-configuration"
    ]) {
      for (const alias of ALIAS_HOSTNAMES) {
        const response = canonicalHostRedirect(new URL(`https://${alias}${path}`));
        expect(response?.status, path).toBe(308);
        expect(response?.headers.get("location"), path).toBe(`https://${HOST}${path}`);
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

  it("redirects other paths beside the former served routes", () => {
    for (const path of ["/mcpx", "/authorized", "/tokens", "/callbacks"]) {
      expect(canonicalHostRedirect(new URL(`https://agents.stellar.buzz${path}`))?.status, path).toBe(308);
    }
  });
});
