#!/usr/bin/env node
import { createHash, randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { open, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

export const API_KEY_PREFIX = "raven:api-key:v1:";
export const API_KEY_NAME_PATTERN = /^[a-z][a-z0-9-]{0,31}$/;
const ACTIONS = new Set(["create", "rotate", "revoke"]);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WRANGLER = resolve(ROOT, "node_modules/.bin/wrangler");

export function parseArgs(argv) {
  const [action, name, ...rest] = argv;
  if (!ACTIONS.has(action) || !name || !API_KEY_NAME_PATTERN.test(name)) {
    throw new Error("usage: npm run mcp-key -- <create|rotate|revoke> <name> [--out path]");
  }
  let out;
  if (rest.length) {
    if (action === "revoke" || rest.length !== 2 || rest[0] !== "--out" || !rest[1]) {
      throw new Error("usage: npm run mcp-key -- <create|rotate|revoke> <name> [--out path]");
    }
    out = resolve(rest[1]);
  }
  return { action, name, out };
}

export function kvKey(name) {
  return `${API_KEY_PREFIX}${name}`;
}

export function generateCredential(name) {
  return `${name}:${randomBytes(32).toString("base64url")}`;
}

export function tokenDigest(credential) {
  return createHash("sha256").update(credential.slice(credential.indexOf(":") + 1)).digest("hex");
}

function realWrangler(args) {
  return spawnSync(WRANGLER, args, { cwd: ROOT, encoding: "utf8" });
}

function checked(result) {
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "wrangler command failed").trim());
  }
  return result.stdout;
}

async function reserveOutput(path) {
  if (!path) return undefined;
  const handle = await open(path, "wx", 0o600);
  return {
    async write(value) {
      await handle.writeFile(`${value}\n`, "utf8");
      await handle.close();
    },
    async discard() {
      await handle.close().catch(() => {});
      await rm(path, { force: true });
    }
  };
}

export async function run(argv, options = {}) {
  const { action, name, out } = parseArgs(argv);
  const runWrangler = options.runWrangler ?? realWrangler;
  const output = await reserveOutput(out);
  try {
    const key = kvKey(name);
    const listed = JSON.parse(checked(runWrangler([
      "kv", "key", "list", "--binding", "OAUTH_KV", "--remote", "--prefix", key
    ])));
    if (!Array.isArray(listed)) throw new Error("wrangler returned an invalid API key listing");
    const exists = listed.some((entry) => entry?.name === key);
    if (action === "create" && exists) throw new Error(`API key "${name}" already exists`);
    if (action !== "create" && !exists) throw new Error(`API key "${name}" does not exist`);

    if (action === "revoke") {
      checked(runWrangler(["kv", "key", "delete", key, "--binding", "OAUTH_KV", "--remote"]));
      return { message: `Revoked API key "${name}".` };
    }

    const credential = generateCredential(name);
    const digestPath = resolve(tmpdir(), `raven-api-key-${process.pid}-${randomBytes(8).toString("hex")}`);
    await writeFile(digestPath, tokenDigest(credential), { mode: 0o600, flag: "wx" });
    try {
      checked(runWrangler([
        "kv", "key", "put", key, "--binding", "OAUTH_KV", "--remote", "--path", digestPath
      ]));
    } finally {
      await rm(digestPath, { force: true });
    }

    if (output) {
      await output.write(credential);
      return { message: `Wrote credential to ${out}.` };
    }
    return { credential };
  } catch (error) {
    await output?.discard();
    throw error;
  }
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  try {
    const result = await run(process.argv.slice(2));
    console.log(result.credential ?? result.message);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
