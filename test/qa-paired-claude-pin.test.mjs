import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, readlinkSync, readdirSync,
  realpathSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createClaudePin, assertClaudePin } from '../.agents/rounds/2026-10-01-backlog-closeout/paired-claude-pin.mjs';
import { managedEnvironment } from '../.agents/rounds/2026-10-01-backlog-closeout/paired-launch-runtime.mjs';

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'paired-claude-pin-'));
  const versions = path.join(root, '.local/share/claude/versions');
  const publicLink = path.join(root, '.local/bin/claude');
  const versionFile = path.join(root, 'version.txt');
  mkdirSync(versions, {recursive:true});
  mkdirSync(path.dirname(publicLink), {recursive:true});
  writeFileSync(versionFile, 'fixture-1 (Claude Code)\n');
  const first = path.join(versions, 'fixture-1');
  const second = path.join(versions, 'fixture-2');
  writeFileSync(first, `#!/bin/sh\n[ "$1" = "--version" ] || exit 99\n/bin/cat '${versionFile}'\n`, {mode:0o700});
  writeFileSync(second, '#!/bin/sh\n[ "$1" = "--version" ] || exit 99\necho "fixture-2 (Claude Code)"\n', {mode:0o700});
  symlinkSync(first, publicLink);
  const env = {...process.env, HOME:root, PAIRED_RUN:root};
  delete env.QA_AGENT_PROMPT_APPEND;
  return {root, publicLink, first, second, versionFile, env};
}

describe('the immutable paired Claude pin', () => {
  it('keeps the versioned executable after another session moves the public link', () => {
    const f = fixture();
    try {
      const pin = createClaudePin(f.env);
      const frozen = assertClaudePin(pin, managedEnvironment(f.env));
      unlinkSync(f.publicLink); symlinkSync(f.second, f.publicLink);
      expect(readlinkSync(f.publicLink)).toBe(f.second);
      expect(readlinkSync(pin.claudePath)).toBe(realpathSync(f.first));
      expect(readdirSync(pin.privateBin)).toEqual(['claude']);
      expect(statSync(pin.privateBin).mode & 0o777).toBe(0o700);
      expect(JSON.parse(readFileSync(path.join(f.root, 'claude-pin.json'), 'utf8'))).toEqual(pin);
      expect(assertClaudePin(pin, managedEnvironment(f.env), frozen.environment.sha256)).toEqual(frozen);
      expect(spawnSync('claude', ['--version'], {env:f.env, encoding:'utf8'}).stdout)
        .toBe('fixture-1 (Claude Code)\n');
      expect(() => createClaudePin(f.env)).toThrow(/EEXIST/);
    } finally { rmSync(f.root, {recursive:true, force:true}); }
  });

  it.each(['link', 'bytes', 'version', 'updater', 'environment', 'PATH', 'entry', 'mode', 'missing'])(
    'rejects a changed %s without refreshing its identity', change => {
      const f = fixture();
      try {
        const pin = createClaudePin(f.env);
        const hash = assertClaudePin(pin, managedEnvironment(f.env)).environment.sha256;
        const record = readFileSync(path.join(f.root, 'claude-pin.json'), 'utf8');
        if (change === 'link') { unlinkSync(pin.claudePath); symlinkSync(f.second, pin.claudePath); }
        if (change === 'bytes') writeFileSync(f.first, '#!/bin/sh\nexit 99\n');
        if (change === 'version') writeFileSync(f.versionFile, 'changed version\n');
        if (change === 'updater') delete f.env.DISABLE_AUTOUPDATER;
        if (change === 'environment') f.env.CLAUDE_PIN_TEST = 'changed';
        if (change === 'PATH') f.env.PATH = `${path.dirname(f.publicLink)}:${f.env.PATH}`;
        if (change === 'entry') writeFileSync(path.join(pin.privateBin, 'extra'), 'extra');
        if (change === 'mode') chmodSync(pin.privateBin, 0o755);
        if (change === 'missing') unlinkSync(f.first);
        expect(() => assertClaudePin(pin, managedEnvironment(f.env), hash)).toThrow();
        expect(readFileSync(path.join(f.root, 'claude-pin.json'), 'utf8')).toBe(record);
      } finally { rmSync(f.root, {recursive:true, force:true}); }
    });

  it('rejects a public target outside the version directory before creating a private link', () => {
    const f = fixture();
    try {
      const outside = path.join(f.root, 'outside');
      writeFileSync(outside, '#!/bin/sh\nexit 99\n', {mode:0o700});
      unlinkSync(f.publicLink); symlinkSync(outside, f.publicLink);
      expect(() => createClaudePin(f.env)).toThrow(/under ~\/\.local/);
      expect(readdirSync(f.root)).not.toContain('claude-bin');
    } finally { rmSync(f.root, {recursive:true, force:true}); }
  });
});
