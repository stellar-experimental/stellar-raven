import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFileSync } from 'node:fs';
import { listFindingFiles, parseFinding } from '../../../scripts/improvements-lib.mjs';

const exec = promisify(execFile);
const findings = listFindingFiles().map(parseFinding);
const refs = new Map();
for (const finding of findings) {
  for (const match of finding.raw.matchAll(/https:\/\/github\.com\/([^/\s)]+\/[^/\s)]+)\/(issues|pull)\/(\d+)/g)) {
    const key = `${match[1]}#${match[3]}`;
    if (!refs.has(key)) refs.set(key, { repo: match[1], number: Number(match[3]), ids: new Set() });
    refs.get(key).ids.add(finding.frontmatter.id);
  }
}
const rows = [...refs.values()];
let cursor = 0;
const results = [];
async function worker() {
  while (cursor < rows.length) {
    const ref = rows[cursor++];
    try {
      const { stdout } = await exec('gh', ['api', `repos/${ref.repo}/issues/${ref.number}`], { maxBuffer: 8 * 1024 * 1024 });
      const issue = JSON.parse(stdout);
      const { stdout: commentsRaw } = await exec('gh', ['api', `repos/${ref.repo}/issues/${ref.number}/comments`, '--paginate', '--slurp'], { maxBuffer: 8 * 1024 * 1024 });
      const comments = JSON.parse(commentsRaw).flat();
      const base = {
        repo: ref.repo, number: ref.number, findings: [...ref.ids].sort(), url: issue.html_url,
        title: issue.title, state: issue.state, stateReason: issue.state_reason,
        updatedAt: issue.updated_at, closedAt: issue.closed_at, author: issue.user.login,
        labels: issue.labels.map(label => label.name),
        latestComments: comments.slice(-3).map(comment => ({ author: comment.user.login, createdAt: comment.created_at, url: comment.html_url, body: comment.body })),
      };
      if (issue.pull_request) {
        const { stdout: prRaw } = await exec('gh', ['pr', 'view', String(ref.number), '-R', ref.repo, '--json', 'state,isDraft,headRefOid,mergeCommit,mergedAt,reviewDecision,reviews,statusCheckRollup,body'], { maxBuffer: 8 * 1024 * 1024 });
        base.pr = JSON.parse(prRaw);
      }
      results.push(base);
    } catch (error) {
      results.push({ repo: ref.repo, number: ref.number, findings: [...ref.ids], error: error.message });
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
results.sort((a, b) => a.repo.localeCompare(b.repo) || a.number - b.number);
const payload = { checkedAt: new Date().toISOString(), findingCount: findings.length, refCount: rows.length, results };
writeFileSync('/tmp/raven-20260929-upstream-detail.json', JSON.stringify(payload, null, 2) + '\n');
const snapshot = { ...payload, results: results.map(ref => ({
  ...ref,
  latestComments: ref.latestComments?.map(({ body, ...metadata }) => metadata),
  pr: ref.pr ? { ...ref.pr, body: undefined,
    reviews: ref.pr.reviews.map(({ body, reactionGroups, ...metadata }) => metadata) } : undefined,
})) };
writeFileSync(new URL('./upstream-state.json', import.meta.url), JSON.stringify(snapshot, null, 2) + '\n');
for (const finding of findings) {
  const id = finding.frontmatter.id;
  const linked = results.filter(ref => ref.findings.includes(id));
  console.log(`${id} | ${finding.frontmatter.status} | ${linked.map(ref => `${ref.repo}#${ref.number} ${ref.error ? 'ERROR' : ref.pr?.state ?? ref.state} ${ref.updatedAt ?? ''}`).join('; ')}`);
}
console.log(`${findings.length} findings; ${rows.length} refs; ${results.filter(ref => ref.error).length} errors`);
