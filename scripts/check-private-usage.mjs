#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const files = git('ls-files', '-z').split('\0').filter(Boolean);
const staged = process.argv.includes('--staged');
const failures = [];
for (const file of files) {
  if (file === 'usage/report-site/public/launch-data.json' || file.startsWith('usage/report-site/evidence/') || /^research\/audits\/.*usage.*\.(json|csv|md)$/.test(file)) failures.push(file);
  if (!file.endsWith('.json')) continue;
  let content;
  try { content = staged ? git('show', `:${file}`) : readFileSync(resolve(root, file), 'utf8'); }
  catch (error) { if (!staged && error.code === 'ENOENT') continue; throw error; }
  try {
    const data = JSON.parse(content);
    const snapshot = data.generatedAt && data.toolWindows && data.months;
    const audit = data.kind === 'independent-audit-counts' || data.gatewayMetadata || data.independentAudit;
    const exportData = data.generatedAt && Array.isArray(data.results) && data.results.some(row => row.response?.result?.viewer?.accounts);
    const synthetic = file.startsWith('usage/report-site/test/') && data.synthetic === true;
    if ((snapshot || audit || exportData) && !synthetic) failures.push(file);
  } catch { /* Credential scanning covers malformed and non-JSON content. */ }
}
if (failures.length) {
  console.error('Private usage data must not be tracked: ' + [...new Set(failures)].join(', '));
  process.exitCode = 1;
} else console.log('Private usage file boundary passed. Review prose and new data formats separately.');
