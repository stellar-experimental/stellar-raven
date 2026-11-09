// The Playground study froze the QA corpus at selection.corpusSha256. Later golden edits change
// eval/qa/cases.json, so tests read the frozen bytes from the commit that produced that hash.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const FROZEN_CORPUS_REVISION = 'e62c2b97f52f338248537f43a3fd3871de67bc83';
const REPO = fileURLToPath(new URL('../../../', import.meta.url));

export function frozenCorpusBytes(expectedSha256) {
  const bytes = execFileSync('git', ['show', `${FROZEN_CORPUS_REVISION}:eval/qa/cases.json`], { cwd: REPO, maxBuffer: 64 * 1024 * 1024 });
  const actual = createHash('sha256').update(bytes).digest('hex');
  if (actual !== expectedSha256) throw new Error(`frozen corpus at ${FROZEN_CORPUS_REVISION} hashes to ${actual}, expected ${expectedSha256}`);
  return bytes;
}
