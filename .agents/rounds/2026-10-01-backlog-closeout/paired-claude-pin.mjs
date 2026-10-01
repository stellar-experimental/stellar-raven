import assert from 'node:assert/strict';
import { accessSync, constants, lstatSync, mkdirSync, readFileSync, readdirSync,
  readlinkSync, realpathSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { executableIdentity, agentEnvironmentIdentity } from '../../../eval/lib/executable-identity.mjs';

const sha256 = file => createHash('sha256').update(readFileSync(file)).digest('hex');

function assertVersionedFile(realPath, versionsDirectory) {
  const relative = path.relative(versionsDirectory, realPath);
  assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative),
    'Claude must resolve to a file under ~/.local/share/claude/versions/');
  assert.ok(lstatSync(realPath).isFile(), 'the versioned Claude executable must be a regular file');
  assert.equal(realpathSync(realPath), realPath, 'the versioned Claude path must be canonical');
  accessSync(realPath, constants.X_OK);
}

// This runs once, before identity capture. Never refresh a pin after a stop.
export function createClaudePin(env) {
  const versionsDirectory = realpathSync(path.join(env.HOME, '.local/share/claude/versions'));
  const realPath = realpathSync(path.join(env.HOME, '.local/bin/claude'));
  assertVersionedFile(realPath, versionsDirectory);
  const privateBin = path.join(realpathSync(env.PAIRED_RUN), 'claude-bin');
  mkdirSync(privateBin, { mode: 0o700 });
  const claudePath = path.join(privateBin, 'claude');
  symlinkSync(realPath, claudePath);
  env.PATH = `${privateBin}${path.delimiter}${env.PATH ?? ''}`;
  env.DISABLE_AUTOUPDATER = '1';
  const binary = executableIdentity('claude', { env });
  const pin = { schema: 'qa-paired-claude-pin-v1', privateBin, claudePath,
    versionsDirectory, realPath, version: binary.version, sha256: binary.sha256 };
  assertClaudePin(pin, env);
  writeFileSync(path.join(env.PAIRED_RUN, 'claude-pin.json'), `${JSON.stringify(pin, null, 2)}\n`,
    { flag: 'wx', mode: 0o600 });
  return pin;
}

export function assertClaudePin(pin, env, expectedEnvironmentSha256) {
  assert.equal(pin?.schema, 'qa-paired-claude-pin-v1', 'the immutable Claude pin is missing');
  for (const name of ['privateBin', 'claudePath', 'versionsDirectory', 'realPath']) {
    assert.ok(path.isAbsolute(pin[name]), `the Claude pin lacks an absolute ${name}`);
  }
  assert.equal(pin.claudePath, path.join(pin.privateBin, 'claude'));
  assert.equal(realpathSync(pin.privateBin), pin.privateBin);
  assert.ok(lstatSync(pin.privateBin).isDirectory());
  assert.equal(statSync(pin.privateBin).mode & 0o777, 0o700, 'the Claude directory must remain private');
  assert.deepEqual(readdirSync(pin.privateBin), ['claude'], 'the Claude directory must contain only its link');
  assert.ok(lstatSync(pin.claudePath).isSymbolicLink(), 'the private Claude path must remain a link');
  assert.equal(readlinkSync(pin.claudePath), pin.realPath, 'the private Claude link changed');
  assert.equal(realpathSync(path.join(env.HOME, '.local/share/claude/versions')), pin.versionsDirectory);
  assertVersionedFile(pin.realPath, pin.versionsDirectory);
  assert.equal(sha256(pin.realPath), pin.sha256, 'the versioned Claude SHA-256 changed');
  assert.equal(env.PATH?.split(path.delimiter)[0], pin.privateBin, 'the private Claude directory must lead PATH');
  assert.equal(env.DISABLE_AUTOUPDATER, '1', 'DISABLE_AUTOUPDATER must remain 1');
  assert.equal(env.QA_AGENT_PROMPT_APPEND, undefined);
  const environment = agentEnvironmentIdentity(env);
  if (expectedEnvironmentSha256 !== undefined) {
    assert.equal(environment.sha256, expectedEnvironmentSha256, 'the frozen Claude environment changed');
  }
  const binary = executableIdentity('claude', { env });
  assert.equal(binary.resolvedPath, pin.claudePath);
  assert.equal(binary.realPath, pin.realPath);
  assert.equal(binary.sha256, pin.sha256, 'the versioned Claude SHA-256 changed');
  assert.equal(binary.version, pin.version, 'the versioned Claude version changed');
  return { binary, environment };
}
