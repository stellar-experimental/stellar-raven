import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadManifest, searchCatalog} from '../src/catalog/search.ts';
const catalog=loadManifest(JSON.parse(fs.readFileSync('catalog/manifest.json','utf8')));
const queries=[
  ['send every payment stella','stellarDocs.search_anchor_sep_docs'],
  ['send every payment searc','stellarDocs.search_anchor_sep_docs'],
  ['send every payment toke','stellarDocs.search_asset_token_docs'],
  ['send alpha model every lumenloop','lumenloop.list_documents']
];
const rows=queries.map(([query,rejected])=>{
  const hits=searchCatalog(catalog,{query,limit:5});
  assert.notEqual(hits[0]?.id,rejected);
  assert(!hits.some(h=>h.id===rejected&&h.tier==='gated'));
  return {query,rank1:hits[0]?.id,score:hits[0]?.score,tier:hits[0]?.tier,top:hits.map(({id,score,tier})=>({id,score,tier}))};
});
fs.writeFileSync('tmp/lane-c-evidence/second-review-prefix-same.json',JSON.stringify(rows,null,2)+'\n');
console.table(rows.map(({top,...row})=>row));
