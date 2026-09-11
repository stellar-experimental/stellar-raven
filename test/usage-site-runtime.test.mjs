import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Miniflare, Response } from "miniflare";

describe("usage site on the Workers runtime", () => {
  it("reaches the upstream API and blocks redirects without forwarding credentials", async () => {
    let redirect = false;
    const requests = [];
    const source = readFileSync(new URL("../usage/report-site/src/server.js", import.meta.url), "utf8");
    const mf = new Miniflare({ workers: [{
      config: {
        name: "usage-site-test", type: "worker", compatibilityDate: "2026-06-11",
        manifest: { mainModule: "server.js", modules: {
          "server.js": { type: "esm", contents: source },
          "assets.js": { type: "esm", contents: "export default {};" }
        } },
        env: {
          USAGE_REPORT_URL: { type: "text", value: "https://report.example/report" },
          USAGE_REPORT_TOKEN: { type: "text", value: "test-report-token" }
        }
      },
      dev: { outboundService: { type: "fetcher", handler: request => {
        requests.push({ url: request.url, authorization: request.headers.get("Authorization") });
        return redirect
          ? new Response(null, { status: 302, headers: { Location: "https://other.example/" } })
          : Response.json({ schema: 1, months: [], days: [], receipts: [] });
      } } }
    }] });
    try {
      expect((await mf.dispatchFetch("http://localhost/api/report")).status).toBe(200);
      redirect = true;
      expect((await mf.dispatchFetch("http://localhost/api/report")).status).toBe(502);
      expect(requests).toEqual([
        { url: "https://report.example/report", authorization: "Bearer test-report-token" },
        { url: "https://report.example/report", authorization: "Bearer test-report-token" }
      ]);
    } finally { await mf.dispose(); }
  });
});
