import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

export const SERVER_TOOLCHAIN_SCHEMA = "qa-paired-server-toolchain-v1";

// Both servers run the candidate server's installed Wrangler, so they run the same files.
export const sharedWranglerEntry = (env) => `${env.PAIRED_CS}/node_modules/wrangler/bin/wrangler.js`;
// `scripts/run-eval-server.mjs` starts the candidate through `npx --no-install wrangler`.
export const candidateWranglerEntry = (env) => `${env.PAIRED_CS}/node_modules/.bin/wrangler`;

function packageRoot(file, name) {
  for (let directory = path.dirname(realpathSync(file)); ; directory = path.dirname(directory)) {
    const manifest = path.join(directory, "package.json");
    if (existsSync(manifest) && JSON.parse(readFileSync(manifest, "utf8")).name === name) return directory;
    assert.notEqual(path.dirname(directory), directory, `cannot find the ${name} package above ${file}`);
  }
}

function packageIdentity(root) {
  const { name, version } = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  return { name, version, root };
}

// Resolve each package the way the running server does: miniflare and esbuild from Wrangler,
// then workerd and its binary from miniflare.
export function serverToolchainIdentity(wranglerEntry, { env = process.env } = {}) {
  assert.equal(env.MINIFLARE_WORKERD_PATH, undefined, "MINIFLARE_WORKERD_PATH overrides the workerd binary");
  const wrangler = packageRoot(wranglerEntry, "wrangler");
  const resolveFrom = (root, name) => createRequire(path.join(root, "package.json")).resolve(name);
  const miniflare = packageRoot(resolveFrom(wrangler, "miniflare"), "miniflare");
  const esbuild = packageRoot(resolveFrom(wrangler, "esbuild"), "esbuild");
  const workerdMain = resolveFrom(miniflare, "workerd");
  const workerd = packageRoot(workerdMain, "workerd");
  const binary = realpathSync(createRequire(workerdMain)(workerdMain).default);
  return {
    schema: SERVER_TOOLCHAIN_SCHEMA,
    wranglerEntry: realpathSync(wranglerEntry),
    packages: Object.fromEntries([wrangler, miniflare, workerd, esbuild]
      .map((root) => packageIdentity(root)).map(({ name, ...identity }) => [name, identity])),
    workerdBinary: { path: binary, sha256: createHash("sha256").update(readFileSync(binary)).digest("hex") }
  };
}

// Fail closed before any server starts: both launch entries must resolve to one toolchain.
export function assertSharedServerToolchain(env, { identify = serverToolchainIdentity } = {}) {
  const baseline = identify(sharedWranglerEntry(env), { env });
  const candidate = identify(candidateWranglerEntry(env), { env });
  assert.deepEqual(baseline, candidate, "the baseline and candidate servers would run different toolchains");
  return baseline;
}
