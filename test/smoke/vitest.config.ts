/**
 * Smoke-lane vitest config. It runs test/smoke/ inside workerd
 * via @cloudflare/vitest-pool-workers, with the real wrangler.jsonc bindings
 * (including the LOADER worker_loaders binding the executor needs).
 *
 * Deliberately a separate project from the root vitest.config.ts: the main
 * unit suite stays plain-Node and fast; this lane boots workerd. Run it with
 * `npm run test:smoke`.
 *
 * Offline by design: tests only exercise paths that never leave the worker —
 * sandbox wiring, envelope guard, policy refusals, route dispatch. Auth
 * values are test-only fakes injected via miniflare bindings (no .dev.vars
 * dependency, no real secrets).
 *
 * Note: pool-workers 0.18 (vitest 4) exposes `cloudflareTest` as a Vite
 * plugin — the old `defineWorkersConfig` / "/config" subpath is gone.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";
import { loadSkillTexts, skillFileUrl } from "../../scripts/lib/skill-mirror.mjs";

/**
 * Pinned skill bodies, keyed by the exact raw.githubusercontent.com URL the
 * catalog transports carry. Skill content is no longer bundled into the
 * Worker, so `codemode.skill.read` performs a host-side fetch — the smoke lane
 * models upstream as a local stub rather than punching a hole in the offline
 * wall. Bytes are served UNSCRUBBED, exactly as upstream has them, so the
 * Worker's git-blob-sha verification runs for real inside workerd.
 *
 * Read from the builders' working cache (populated by any catalog/spec build);
 * a cold cache fetches once here and never again.
 */
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
      // Absolute path: pool-workers resolves a relative configPath against
      // the process cwd, not this config file. (.href because @types/node 26
      // and lib es2022 disagree on the URL type itself.)
      wrangler: { configPath: fileURLToPath(new URL("../../wrangler.jsonc", import.meta.url).href) },
      // The demo's `ai` binding is remote-only; with the default
      // remoteBindings:true the pool opens a Cloudflare remote-proxy session
      // at startup, which needs credentials CI deliberately lacks (offline
      // lane). No smoke test calls the model — the /demo/chat tests stop at
      // the auth/origin gauntlet — so remote bindings stay off.
      remoteBindings: false,
      miniflare: {
        bindings: {
          // Fake key so the lumenloop adapter passes its config guard; the
          // only "upstream" it can reach is a test-local fetch stub.
          LUMENLOOP_API_KEY: "smoke-test-lumenloop-key",
          // Same for the docs adapter's config guard: without these the
          // stellarDocs ops fail before dispatch, which silently changed
          // recovery-hint assertions depending on whether a local .dev.vars
          // happened to exist. Fakes keep the lane .dev.vars-independent, as
          // its docstring promises (outbound is stubbed per test anyway).
          ALGOLIA_APPLICATION_ID_DOCS: "SMOKETESTAPPID",
          ALGOLIA_API_KEY_DOCS: "smoke-test-algolia-key",
          // Set so server.test.ts can assert the bypass's hostname second
          // factor AT THE ASSEMBLY LEVEL: honored on localhost, inert on the
          // public hostname (gate.ts logic itself is unit-tested).
          DEV_ALLOW_UNAUTHENTICATED: "true"
        },
        // Offline ENFORCED: any outbound fetch that escapes the tests' local
        // stubs hits this wall instead of the network — EXCEPT pinned skill
        // files, which are served from the local map above so skill.read (and
        // its integrity check) is exercised without real network. (pool-workers
        // 0.18 dropped `fetchMock` from cloudflare:test — the vitest-4 rework —
        // so enforcement lives here and per-test mocking uses vi.stubGlobal;
        // tests run in the same isolate as the main worker, so global stubs
        // apply to host-side adapter fetches too.)
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
