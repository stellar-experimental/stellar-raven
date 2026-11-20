/**
 * Workerd smoke-lane config (`npm run test:smoke`) using @cloudflare/vitest-plugin.
 * Runs offline against wrangler.jsonc bindings; a cold skill cache fetches pinned files during setup.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";
import { loadSkillTexts, skillFileUrl } from "../../scripts/lib/skill-mirror.mjs";

// Serve unscrubbed pinned skill bytes locally so workerd runs real sha256/git-blob verification offline.
const manifest = JSON.parse(
  // .href for the same @types/node-vs-lib URL mismatch noted on wrangler.configPath below.
  readFileSync(fileURLToPath(new URL("../../ecosystem-skills/MANIFEST.json", import.meta.url).href), "utf8")
);
const skillTexts = await loadSkillTexts(manifest);
const pinnedBodies = new Map<string, string>();
for (const source of manifest.sources) {
  for (const skill of source.skills) {
    for (const file of skill.files ?? []) {
      const loaded = skillTexts.get(`${source.id}/${skill.name}/${file.path}`);
      if (loaded !== undefined) {
        pinnedBodies.set(skillFileUrl(source, skill.name, file.path), loaded.text);
      }
    }
  }
}

export default defineConfig({
  plugins: [
    cloudflareTest({
      // Absolute path: the plugin resolves a relative configPath against
      // the process cwd, not this config file. (.href because @types/node 26
      // and lib es2022 disagree on the URL type itself.)
      wrangler: { configPath: fileURLToPath(new URL("../../wrangler.jsonc", import.meta.url).href) },
      // Keep remoteBindings off so the offline lane does not open a Cloudflare AI remote-proxy session.
      remoteBindings: false,
      miniflare: {
        bindings: {
          // Fake adapter keys keep the lane .dev.vars-independent; outbound fetches are stubbed per test.
          LUMENLOOP_API_KEY: "smoke-test-lumenloop-key",
          MINTLIFY_ASSISTANT_API_KEY: "smoke-test-mintlify-key",
          // Enables assembly-level localhost vs public-hostname bypass tests in server.test.ts.
          DEV_ALLOW_UNAUTHENTICATED: "true"
        },
        // Block all outbound fetches except pinned skill URLs served from pinnedBodies above.
        outboundService(request: Request) {
          const body = pinnedBodies.get(request.url);
          if (body !== undefined) {
            return new Response(body, {
              status: 200,
              headers: { "content-type": "text/plain; charset=utf-8" }
            });
          }
          return new Response("smoke lane is offline — unexpected outbound fetch", { status: 503 });
        }
      }
    })
  ],
  test: {
    // Scoped to the smoke dir — vitest's root is the process cwd (repo
    // root), so a bare glob would sweep in the plain-Node unit suite.
    include: ["test/smoke/**/*.test.ts"]
  }
});
