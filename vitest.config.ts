/**
 * Plain-Node tests use a cloudflare:workers stub for OAuthProvider construction.
 * The separate smoke configuration runs the assembled Worker in workerd.
 * Exclusions keep worktree copies, smoke tests, and report-site tests out of this suite.
 */
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "cloudflare:workers": fileURLToPath(new URL("./test/stubs/cloudflare-workers.ts", import.meta.url))
    }
  },
  test: {
    // Agent worktrees under .claude/worktrees/ carry a full copy of test/ —
    // without this exclude their duplicates run too and double the suite.
    // test/smoke/ is the workerd lane (`npm run test:smoke`, its own config):
    // its tests import `cloudflare:test`, which plain Node cannot load.
    exclude: ["**/node_modules/**", ".claude/**", "test/smoke/**", "usage/report-site/test/**"],
    server: {
      deps: {
        // Externalized deps resolve through Node's loader, which cannot see
        // the alias above — inline the provider so Vite transforms it.
        inline: ["@cloudflare/workers-oauth-provider"]
      }
    }
  }
});
