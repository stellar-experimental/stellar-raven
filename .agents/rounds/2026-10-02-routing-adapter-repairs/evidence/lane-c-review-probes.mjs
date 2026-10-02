import fs from 'node:fs';
import assert from 'node:assert/strict';
import { loadManifest, searchCatalog } from '../src/catalog/search.ts';
import { prepareScoringQuery, scoreEntryWeighted, scoreEntryWeightedUngated } from '../src/catalog/scoring.ts';
import { lastIdSegment } from '../src/catalog/id.ts';
const catalog = loadManifest(JSON.parse(fs.readFileSync('catalog/manifest.json', 'utf8')));
const queries = [
  'send every payment', 'show exchange prices', 'smart escrow patterns',
  'create ledger items', 'simple demo kit', 'recent protocol changes',
  'read public contracts', 'smart contract framework', 'network operations team',
  'never open trades', 'offer new endpoints', 'model context protocol'
];
const rows = queries.map(query => {
  const prepared = prepareScoringQuery(query);
  const lexical = { ...prepared, acronyms: [] };
  for (const e of catalog.entries) {
    const entry = { ...e, name: lastIdSegment(e.id) };
    assert.equal(scoreEntryWeighted(entry, query, prepared), scoreEntryWeighted(entry, query, lexical), `${query}: ${e.id} gained an acronym score`);
    assert.equal(scoreEntryWeightedUngated(entry, query, prepared), scoreEntryWeightedUngated(entry, query, lexical));
  }
  const top = searchCatalog(catalog, {query, limit: 5});
  return {query, rank1: top[0]?.id ?? null, score: top[0]?.score ?? null, tier: top[0]?.tier ?? null};
});
const cases = JSON.parse(fs.readFileSync('eval/routing-cases.json', 'utf8'));
const query = cases.cases.find(c => c.id === 'q-soroban-sac-vs-custom-token').question;
const e = catalog.entries.find(e => e.id === 'stellarDocs.search_asset_token_docs');
const entry = {...e, name: lastIdSegment(e.id)};
const sac = {query, gated: scoreEntryWeighted(entry, query), ungated: scoreEntryWeightedUngated(entry, query),
  top: searchCatalog(catalog, {query, limit: 5}).map(({id,score,tier})=>({id,score,tier}))};
assert.equal(sac.gated, null);
assert.equal(sac.ungated, 812);
fs.writeFileSync('tmp/lane-c-evidence/second-review-false-positives.json', JSON.stringify({rows, sac}, null, 2) + '\n');
console.table(rows);
console.log(JSON.stringify(sac, null, 2));
