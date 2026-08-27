import { createHash } from "node:crypto";
import { accessSync, constants, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const AGENT_ENV_NAME_PATTERN = /^(?:ANTHROPIC_|CLAUDE_|QA_AGENT_PROMPT_APPEND$|RAVEN_CLAUDE_)/;
const AGENT_ENV_EXACT_NAMES = new Set(["CI", "HOME", "NODE_OPTIONS", "PATH", "SHELL", "TMPDIR"]);

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function resolveExecutable(command, env = process.env) {
  if (typeof command !== "string" || !command) {
    throw new Error("executable identity: command is required");
  }
  const candidates = command.includes(path.sep)
    ? [path.resolve(command)]
    : String(env.PATH ?? "")
        .split(path.delimiter)
        .filter(Boolean)
        .map((directory) => path.join(directory, command));
  for (const candidate of candidates) {
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Continue to the next PATH entry.
    }
  }
  throw new Error(`executable identity: ${command} was not found on PATH`);
}

export function executableIdentity(command = "claude", options = {}) {
  const resolvedPath = resolveExecutable(command, options.env ?? process.env);
  const versionResult = (options.spawnSyncImpl ?? spawnSync)(resolvedPath, ["--version"], {
    encoding: "utf8",
    timeout: 10_000,
    maxBuffer: 1024 * 1024,
    env: options.env ?? process.env
  });
  if (versionResult.error || versionResult.status !== 0) {
    throw new Error(
      `executable identity: ${resolvedPath} --version failed: ${String(versionResult.stderr || versionResult.error?.message || versionResult.status).trim()}`
    );
  }
  return {
    command,
    resolvedPath,
    realPath: realpathSync(resolvedPath),
    sha256: sha256(readFileSync(resolvedPath)),
    version: String(versionResult.stdout).trim()
  };
}

export function assertExpectedExecutable(identity, expectedSha256, { label = "agent executable" } = {}) {
  const expected = typeof expectedSha256 === "string" ? expectedSha256.trim().toLowerCase() : "";
  if (!SHA256_PATTERN.test(expected)) {
    throw new Error(`${label}: --expect-agent-binary-sha256 must be a 64-character lowercase SHA-256`);
  }
  if (identity.sha256 !== expected) {
    throw new Error(
      `${label}: expected SHA-256 ${expected}, resolved ${identity.resolvedPath} with ${identity.sha256}; refusing paid calls`
    );
  }
  return { ...identity, expectedSha256: expected, matches: true };
}

/**
 * Record the process environment that can change Claude CLI behavior without
 * writing any environment value, credential, or token into the result file.
 */
export function agentEnvironmentIdentity(env = process.env) {
  const variableNames = Object.keys(env)
    .filter((name) => AGENT_ENV_EXACT_NAMES.has(name) || AGENT_ENV_NAME_PATTERN.test(name))
    .sort();
  const entries = variableNames.map((name) => [name, String(env[name] ?? "")]);
  return {
    schema: "claude-agent-environment-v1",
    variableCount: variableNames.length,
    variableNames,
    sha256: sha256(JSON.stringify(entries))
  };
}
