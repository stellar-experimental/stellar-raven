import { it, expect } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
it('checks staged data from any directory and allows only synthetic test fixtures', () => {
  const root = mkdtempSync(join(tmpdir(), 'usage-guard-'));
  const script = fileURLToPath(new URL('../scripts/check-private-usage.mjs', import.meta.url));
  const git = (...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe' });
  const check = cwd => spawnSync(process.execPath, [script, '--staged'], { cwd }).status;
  const save = (path, data) => { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), JSON.stringify(data)); };
  try {
    git('init', '-q');
    const path = 'usage/report-site/test/fixture.json';
    const data = { generatedAt: 'synthetic', months: [], toolWindows: [] };
    save(path, data); git('add', '.');
    save(path, { ...data, synthetic: true });
    expect(check(root)).toBe(1);
    git('add', '.');
    expect(check(join(root, 'usage'))).toBe(0);
    save('large.json', { syntheticPadding: 'x'.repeat(2 * 1024 * 1024) }); git('add', '.');
    expect(check(root)).toBe(0);
    save('unrelated-location.json', { generatedAt: 'synthetic', results: [{ response: { result: { viewer: { accounts: [] } } } }] }); git('add', '.');
    expect(check(join(root, 'usage'))).toBe(1);
    git('rm', '--cached', 'unrelated-location.json');
    save('usage/report-site/public/launch-data.json', { synthetic: true }); git('add', '.');
    expect(check(root)).toBe(1);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
