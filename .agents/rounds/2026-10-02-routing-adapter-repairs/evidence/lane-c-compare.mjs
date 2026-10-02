import fs from 'node:fs';
import assert from 'node:assert/strict';
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const base = read('tmp/lane-c-evidence/baseline.json');
const result = {};
for (const candidate of ['prefix', 'acronym-max', 'final', 'review-fixed', 'second-review-fixed']) {
  const next = read(`tmp/lane-c-evidence/${candidate}.json`);
  assert.equal(next.manifest.sha256, base.manifest.sha256);
  const lanes = {};
  for (const lane of ['cases', 'extendedCases', 'skillsCases', 'holdoutCases', 'protocolHistoryCases']) {
    assert.deepEqual(next[lane].map(r => r.id), base[lane].map(r => r.id));
    const regressions = [], gains = [], changedRows = [];
    for (const [i, row] of next[lane].entries()) {
      const previous = base[lane][i];
      if (JSON.stringify(previous) !== JSON.stringify(row)) changedRows.push({id: row.id, before: previous, after: row});
      for (const metric of Object.keys(previous).filter(k => typeof previous[k] === 'boolean')) {
        if (previous[metric] === row[metric]) continue;
        const regression = metric === 'forbiddenCapture' ? row[metric] : previous[metric];
        (regression ? regressions : gains).push({id: row.id, metric, before: previous[metric], after: row[metric]});
      }
    }
    lanes[lane] = {n: next[lane].length, regressions, gains, changedRows};
  }
  result[candidate] = {manifest: next.manifest, gate: next.gate, overall: next.overall,
    extended: next.extendedLane.strict, skills: next.skillsLane, holdout: next.holdoutLane, lanes};
  console.log(candidate, JSON.stringify({overall: next.overall, extended:next.extendedLane.strict,
    skills:next.skillsLane, holdout:next.holdoutLane,
    lanes: Object.fromEntries(Object.entries(lanes).map(([k,v])=>[k,{n:v.n,regressions:v.regressions.length,gains:v.gains.length,changedRows:v.changedRows.length}]))}, null, 2));
}
fs.writeFileSync('tmp/lane-c-evidence/second-review-fixed-comparison.json', JSON.stringify(result, null, 2) + '\n');
assert(Object.values(result['second-review-fixed'].lanes).every(l => l.regressions.length === 0 && l.gains.length === 0));
console.log('Second review-fixed candidate: zero per-case grade changes against pinned 76c7f02b.');
