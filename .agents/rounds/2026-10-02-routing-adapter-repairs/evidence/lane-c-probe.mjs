import fs from 'node:fs';
import { loadManifest, searchCatalog } from '../src/catalog/search.ts';
import { scoreEntryWeighted, scoreEntryWeightedUngated } from '../src/catalog/scoring.ts';
import { lastIdSegment } from '../src/catalog/id.ts';
const catalog = loadManifest(JSON.parse(fs.readFileSync('catalog/manifest.json', 'utf8')));
const entry = catalog.entries.find(e => e.id === 'scout.listSkills');
const scorable = { ...entry, name: lastIdSegment(entry.id) };
const queries = [
  'Are there any model context protocol skills for Stellar?',
  'Are there any MCP skills for Stellar?',
  'What Stellar AI skills can I install?',
  'List Stellar skills',
];
const rows = queries.map(query => {
  const top = searchCatalog(catalog, { query, limit: 5 });
  const defaultPage = searchCatalog(catalog, { query });
  const wide = searchCatalog(catalog, { query, limit: 50 });
  return { query, top: top.map(({id, score, tier}) => ({id, score, tier})),
    defaultPage: defaultPage.map(({id, score, tier}) => ({id, score, tier})),
    targetDefaultRank: defaultPage.findIndex(e => e.id === entry.id) + 1 || null,
    targetPageRank: top.findIndex(e => e.id === entry.id) + 1 || null,
    targetWideRank: wide.findIndex(e => e.id === entry.id) + 1 || null,
    targetGatedScore: scoreEntryWeighted(scorable, query),
    targetUngatedScore: scoreEntryWeightedUngated(scorable, query) };
});
fs.writeFileSync(process.argv[2] ?? 'tmp/lane-c-evidence/second-review-fixed-probes.json', JSON.stringify(rows, null, 2) + '\n');
console.log(JSON.stringify(rows, null, 2));
