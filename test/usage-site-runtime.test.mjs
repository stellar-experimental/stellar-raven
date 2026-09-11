import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Miniflare, Response } from "miniflare";

describe("usage site on the Workers runtime", () => {
  it("reaches the upstream API and blocks redirects without forwarding credentials", async () => {
    let redirect = false;
    let unavailable = false;
    const launch = JSON.parse(readFileSync(new URL("../usage/report-site/test/launch-fixture.json", import.meta.url), "utf8"));
    const requests = [];
    const source = readFileSync(new URL("../usage/report-site/src/server.js", import.meta.url), "utf8");
    const mf = new Miniflare({ workers: [{
      config: {
        name: "usage-site-test", type: "worker", compatibilityDate: "2026-06-11",
        manifest: { mainModule: "server.js", modules: {
          "server.js": { type: "esm", contents: source },
          "assets.js": { type: "esm", contents: "export default {};" },
          "launch.js": { type: "esm", contents: readFileSync(new URL("../usage/report-site/src/launch.js", import.meta.url), "utf8") }
        } },
        env: {
          USAGE_REPORT_URL: { type: "text", value: "https://report.example/report" },
          USAGE_REPORT_TOKEN: { type: "text", value: "test-report-token" }
        }
      },
      dev: { outboundService: { type: "fetcher", handler: request => {
        requests.push({ url: request.url, authorization: request.headers.get("Authorization") });
        if (unavailable) return new Response(null, { status: 404 });
        return redirect
          ? new Response(null, { status: 302, headers: { Location: "https://other.example/" } })
          : Response.json(request.url.endsWith("/launch") ? launch : { schema: 1, months: [], days: [], receipts: [] });
      } } }
    }] });
    try {
      expect((await mf.dispatchFetch("http://localhost/api/report")).status).toBe(200);
      const launchResponse = await mf.dispatchFetch("http://localhost/launch");
      expect(launchResponse.status).toBe(200);
      expect(launchResponse.headers.get("Cache-Control")).toBe("no-store");
      expect(await launchResponse.text()).toContain("Synthetic test data.");
      for (const [path, type] of [["/launch.csv", "text/csv"], ["/launch-report.md", "text/markdown"]]) {
        const response = await mf.dispatchFetch("http://localhost" + path);
        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toContain(type);
      }
      const head = await mf.dispatchFetch("http://localhost/launch", { method: "HEAD" });
      expect(head.status).toBe(200);
      expect(await head.text()).toBe("");
      redirect = true;
      expect((await mf.dispatchFetch("http://localhost/api/report")).status).toBe(502);
      redirect = false; unavailable = true;
      expect((await mf.dispatchFetch("http://localhost/launch")).status).toBe(404);
      expect(requests.every(request => ["https://report.example/report", "https://report.example/launch"].includes(request.url))).toBe(true);
      expect(requests.every(request => request.authorization === "Bearer test-report-token")).toBe(true);
      expect(requests).toHaveLength(7);
    } finally { await mf.dispose(); }
  });
});
