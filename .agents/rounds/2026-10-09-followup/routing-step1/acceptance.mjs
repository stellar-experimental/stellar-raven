import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const label = process.argv[2];
assert.ok(/^(baseline|step1)-(main|fresh)$/.test(label), 'Use one of the four measured labels.');
// An optional source root permits patched replay under tmp/ without tracked-file writes.
const sourceRoot = process.argv[3] ?? '.';
const sourceModule = path => import(pathToFileURL(resolve(sourceRoot, path)).href);
const {loadManifest, searchCatalogPage} = await sourceModule('src/catalog/search.ts');
const {scoreEntryWeighted, scoreEntryWeightedUngated, scoreEntryUngated} = await sourceModule('src/catalog/scoring.ts');
const {scoreEntry, tokenize} = await sourceModule('src/catalog/vendor/search-scoring.ts');
const {extractRoutingPhrases, extractRoutingExclusions} = await sourceModule('src/catalog/extract-routing-phrases.ts');
const {extractKeywords} = await sourceModule('src/catalog/extract-keywords.ts');
const prefix = 'tmp/routing3/';
const pair = label.replace(/-(main|fresh)$/, '');
const read = path => JSON.parse(fs.readFileSync(path));
const measured = read(`${prefix}${label}.json`);
const baseline = read(`${prefix}baseline-main.json`);
const fresh = read(`${prefix}${pair}-fresh.json`);
const main = read(`${prefix}${pair}-main.json`);
const catalogBytes = fs.readFileSync(`${prefix}${label}-manifest.json`);
assert.equal(createHash('sha256').update(catalogBytes).digest('hex'), measured.manifest.sha256);
const catalog = loadManifest(JSON.parse(catalogBytes));
const freshCatalog = read(`${prefix}${pair}-fresh-manifest.json`);
const freshInventory = read(`${prefix}fresh-inventory/stellar-light.json`);
const rwaInventoryPath = `${prefix}${label.endsWith('fresh') ? 'fresh-inventory' : 'accepted/inventory'}/stellar-light.json`;
const rwaInventoryBytes = fs.readFileSync(rwaInventoryPath);
const rwaInventory = JSON.parse(rwaInventoryBytes);
// Keep the published fixture construction from test/fixtures/rwa-routing.ts,
// but read its inventory from the measured label rather than the working tree.
const rwaOperation = rwaInventory.openapi.paths['/api/rwa'].get;
const rwaRouting = {...rwaOperation['x-routing'], purpose: [rwaOperation['x-routing'].purpose]};
const rwaDescription = `${rwaOperation.summary}. ${rwaOperation.description}`;
const rwaEntry = {
 id: 'scout.getRwaAssets', service: 'scout', kind: 'operation', description: rwaDescription,
 inputSchema: {type: 'object', properties: Object.fromEntries(rwaOperation.parameters.map(parameter =>
  [parameter.name, {...parameter.schema, description: parameter.description}]))},
 outputSchema: rwaOperation.responses['200'].content['application/json'].schema,
 routingKeywords: extractKeywords([
  ...rwaRouting.purpose, ...rwaRouting.useWhen, ...rwaRouting.exampleQuestions, ...rwaRouting.keywords
 ].join('\n'), {exclude: ['scout.getRwaAssets', 'scout', 'operation', rwaDescription], cap: 256}),
 routingPhrases: extractRoutingPhrases(rwaRouting),
 routingExclusions: extractRoutingExclusions(rwaRouting.notFor),
 transport: {type: 'http', method: 'GET', path: '/api/rwa', base: 'https://stellarlight.xyz'},
 provenance: {source: 'inventory/stellar-light.json', fetchedAt: rwaInventory.fetchedAt}
};
const laneNames = ['cases', 'extendedCases', 'skillsCases', 'holdoutCases', 'protocolHistoryCases'];
for (const run of [measured, baseline, fresh, main]) {
  assert.deepEqual(laneNames.map(k => run[k].length), [338,122,23,49,12]);
  for (const key of laneNames) assert.deepEqual(run[key].map(r=>r.id), baseline[key].map(r=>r.id));
}
const allRows = run => laneNames.flatMap(k => run[k]);
const gradeKeys = ['top1','top3','top5','cardHit5','any1','any3','any5','forbiddenCapture','pass'];
const gradeChanges = (before,after) => {
 const rows = new Map(allRows(after).map(row=>[row.id,row]));
 return allRows(before).flatMap(row=>{
  const next=rows.get(row.id);
  const changes=gradeKeys.filter(key=>row[key]!==next[key]);
  return changes.length ? [{id:row.id,changes:Object.fromEntries(changes.map(key=>[key,{before:row[key],after:next[key]}]))}] : [];
 });
};
const losses = (before,after,ids) => ids.map(id=>{
 const a=allRows(before).find(r=>r.id===id), b=allRows(after).find(r=>r.id===id);
 assert.ok(a&&b, `Missing ${id}`);
 return {id,before:a,after:b,losses:gradeKeys.filter(key=>key!=='forbiddenCapture'&&a[key]===true&&b[key]!==true)};
});
const manifestFailure = 'catalog/manifest.json SHA-256 does not match the committed gate evidence — re-baseline gates.json explicitly';
const numericFailures = run => run.gate.failures.filter(f=>f!==manifestFailure);
const extendedLosses = run => ['top1','top3','top5','cardHit5'].filter(k=>run.extendedLane.strict[k]<baseline.extendedLane.strict[k]);
const cases = JSON.parse(fs.readFileSync('eval/routing-cases.json'));
const allCases = [...cases.cases, ...cases.extendedCases];
const hits = (query, source = catalog) => searchCatalogPage(source, {query, limit: 5}).hits.map(({id,score,tier})=>({id,score,tier}));
const has = (query, id, source) => hits(query,source).some(h=>h.id===id);
const testSource = fs.readFileSync('test/drift-141-routing.test.ts','utf8');
const eight = Function(`return ${testSource.match(/const rows = (\[[\s\S]*?\]) as const;/)[1]}`)();
const out = {label, checks:{}, rows:{}};
for(const id of ['q-defi-agentic-payment-standards-compare','q-defi-blend-alternatives','q-defi-rwa-overview','q-scf-funded-similar-payroll','q-tool-wallets-kit','q-pc-sequence-numbers-ordering-replace']) {
  const query=allCases.find(row=>row.id===id).question;
  out.rows[id]={query,hits:hits(query)};
}
const research=catalog.entries.find(e=>e.id==='scout.searchResearch');
const capProbe=extractRoutingPhrases({purpose:['alpha beta','gamma delta','epsilon zeta'],useWhen:['yieldblox oracle'],exampleQuestions:['reflector incident']},6);
out.checks[1]={pass:['yieldblox','reflector'].every(token=>capProbe.some(p=>p.tokens.includes(token))) && has(eight[0][0],'scout.searchResearch'),capProbe, tokens:['yieldblox','reflector'].map(token=>({token,retained:research.routingPhrases.filter(p=>p.tokens.includes(token))})), hits:hits(eight[0][0])};
out.checks[2]={rows:['through','network','each','walk through'].map(query=>({query,hits:hits(query),pass:!has(query,'scout.searchResearch')}))};
out.checks[2].pass=out.checks[2].rows.every(r=>r.pass);
out.checks[3]={pass:!has('contract','scout.explainRepo')&&has('explain the contract repository code','scout.explainRepo'),negative:hits('contract'),positive:hits('explain the contract repository code')};
const mergeQueries=[eight[6][0].replace('use ',''),eight[6][0]];
const mergeRows=mergeQueries.map(query=>({query,hits:hits(query)}));
out.checks[4]={pass:mergeRows.every(row=>row.hits.some(h=>h.id==='stellarDocs.search_docs_in_category')&&!row.hits.some(h=>h.id==='scout.hackathonBrief')),rows:mergeRows};
const schemaEntry={id:'demo.has',name:'has',service:'demo',kind:'operation',description:'Retrieve widgets'};
const schemaNull={...schemaEntry,id:'demo.lookup',name:'lookup'};
const phase=[schemaEntry,schemaNull].map(entry=>({entry,query:'has widgets',before:scoreEntryWeighted({...entry,keywords:['widgets']},'has widgets'),after:scoreEntryWeighted({...entry,keywords:['widgets','phase']},'has widgets')}));
const generic=scoreEntryWeighted({...schemaNull,keywords:['status','phase','value']},'status phase value');
const ungatedPhase=[schemaEntry,schemaNull].map(entry=>({entry,query:'has widgets',before:scoreEntryWeightedUngated({...entry,keywords:['widgets']},'has widgets'),after:scoreEntryWeightedUngated({...entry,keywords:['widgets','phase']},'has widgets')}));
out.checks[5]={pass:phase.every(r=>r.before===r.after)&&ungatedPhase.every(r=>r.before===r.after)&&generic===null,phase,ungatedPhase,generic};
const syntheticQuery = 'alpha beta gamma wallet dapp';
const syntheticProbe = (description) => {
 const scout = {id:'scout.weak0',name:'weak0',service:'scout',kind:'operation',description};
 const docs = {id:'docs.walletDapp',name:'walletDapp',service:'docs',kind:'operation',description:'wallet dapp'};
 const source = {...catalog,entries:[...Array.from({length:5},(_,i)=>({...scout,id:`scout.weak${i}`,name:`weak${i}`})),docs]};
 const page = hits(syntheticQuery,source);
 return {query:syntheticQuery,description,scoutGatedScore:scoreEntryWeighted(scout,syntheticQuery),docsUngatedScore:scoreEntryWeightedUngated(docs,syntheticQuery),hits:page,docsPresent:page.some(h=>h.id===docs.id)};
};
const weakGated = [syntheticProbe('alphabet betamax gammaray'),syntheticProbe('xalphax xbetax xgammax')];
assert.ok(weakGated.every(probe=>probe.scoutGatedScore!==null), 'The weak controls must pass the vendor gate.');
// Whole-word Scout evidence is stronger by intent coverage. Keep it diagnostic only.
const wholeWordDiagnostic = syntheticProbe('alpha beta gamma');
out.checks[6]={pass:has(eight[7][0],'stellarDocs.search_asset_token_docs')&&out.rows['q-tool-wallets-kit'].hits.some(h=>h.id==='stellarDocs.search_wallet_dapp_docs')&&weakGated.every(probe=>probe.docsPresent),staking:hits(eight[7][0]),wallets:out.rows['q-tool-wallets-kit'],weakGated,wholeWordDiagnostic};
out.checks[7]={rows:eight.map(([query,expected])=>({query,expected,hits:hits(query),pass:expected.some(id=>has(query,id))}))};
out.checks[7].presencePass=out.checks[7].rows.every(r=>r.pass);
const priorRows=[...baseline.cases,...baseline.extendedCases,...baseline.skillsCases];
const measuredRows=[...measured.cases,...measured.extendedCases,...measured.skillsCases];
const originalEight=['q-comp-yieldblox-oracle-incident','q-defi-rwa-scf-similar','q-protocol-network-passphrases-list','q-skill-soroban-first-contract','q-protocol-parallel-execution','q-soroban-reentrancy','q-pc-account-merge-reclaim-reserve','q-defi-build-staking-for-own-token'];
out.checks[7].grades=originalEight.map(id=>{
  const before=priorRows.find(candidate=>candidate.id===id);
  const after=measuredRows.find(candidate=>candidate.id===id);
  if(!before||!after) throw new Error(`Missing original control ${id}`);
  const keys=['top1','top3','top5','cardHit5'];
  return {id,before:Object.fromEntries(keys.map(key=>[key,before[key]])),after:Object.fromEntries(keys.map(key=>[key,after[key]])),losses:keys.filter(key=>before[key]===true&&after[key]!==true)};
});
out.checks[7].pass=out.checks[7].presencePass&&out.checks[7].grades.every(row=>row.losses.length===0);
const rwaCatalog={...catalog,entries:[...catalog.entries,rwaEntry]};
const positives=['Which tokenized real-world assets are live on Stellar?','Show verified tokenized treasury funds and their issuers on Stellar.','Are tokenized bonds and real estate assets live on Stellar?','Is Franklin Templeton BENJI actually issued on Stellar?'];
const ordinaryNegatives=['How do I get test XLM from Friendbot?','What is Stellar RPC?','How can I reduce a Soroban WASM binary size?','How do I simulate a transaction?','How do I fetch account balances?','How do I create and issue a custom Stellar asset?','How do I build a tokenization contract on Stellar?','Walk me through issuing a new custom token on Stellar from scratch.'];
const deferredControls=['Simulate a transfer of a tokenized bond through Stellar RPC.','How do I read a wallet balance for tokenized treasury assets?','As a Stellar asset issuer, can I charge transfer fees, cap supply, or freeze a holder, and what is actually possible at the protocol level?'];
const rwaGroup = (queries,positive) => {
 const rows=queries.map(query=>{
  const page=hits(query,rwaCatalog);
  return {query,positive,hits:page,pass:page.some(hit=>hit.id===rwaEntry.id)===positive};
 });
 return {pass:rows.every(row=>row.pass),rows};
};
out.checks[8]={positives:rwaGroup(positives,true),ordinaryNegatives:rwaGroup(ordinaryNegatives,false),deferredItFails:rwaGroup(deferredControls,false),fixture:{inventoryPath:rwaInventoryPath,inventorySha256:createHash('sha256').update(rwaInventoryBytes).digest('hex'),version:rwaInventory.openapiVersion,entrySha256:createHash('sha256').update(JSON.stringify(rwaEntry)).digest('hex')}};
out.checks[8].pass=out.checks[8].positives.pass&&out.checks[8].ordinaryNegatives.pass&&out.checks[8].deferredItFails.pass;
const improvementQueries = ['top projects by GitHub activity','Is there an open SCF RFP for developer tooling or indexing infrastructure I could build against?'];
const improvementIds = ['q-tool-leaderboard-open-issues','q-scf-rfp-tooling'];
out.checks[9]={probes:improvementQueries.map(query=>({query,hits:hits(query)})),grades:losses(baseline,measured,improvementIds)};
out.checks[9].pass=has(improvementQueries[0],'scout.getLeaderboard')&&has(improvementQueries[1],'scout.getRfps')&&out.checks[9].grades.every(r=>r.losses.length===0);
const applicableGateFailures=label.endsWith('fresh')?numericFailures(measured):measured.gate.failures;
out.checks[10]={pass:applicableGateFailures.length===0&&extendedLosses(measured).length===0,gate:measured.gate,applicableGateFailures,manifestFingerprintIgnored:label.endsWith('fresh'),extendedLosses:extendedLosses(measured),extended:measured.extendedLane,extendedBaseline:baseline.extendedLane,extendedChangedRows:gradeChanges(baseline,measured).filter(r=>measured.extendedCases.some(c=>c.id===r.id))};
const four = ['q-defi-agentic-payment-standards-compare','q-defi-blend-alternatives','q-defi-rwa-overview','q-scf-funded-similar-payroll'];
const freshGrades=losses(baseline,fresh,four);
const freshNumericFailures=numericFailures(fresh);
// Zero per-row grade changes is stricter than a fingerprint-only re-baseline
// under the numeric bands and floors in eval/gates.json. Keep this deliberate
// byte-change-refresh rule, and report every changed row even when totals pass.
const sourceChanges=gradeChanges(main,fresh);
const reviewExposed=freshCatalog.entries.some(e=>e.id==='scout.reviewSubmission');
const reviewCaptures=allRows(fresh).filter(row=>row.topHits.some(hit=>hit.id==='scout.reviewSubmission'));
const versionParts=freshInventory.openapiVersion.split('.').map(Number);
const freshEnough=versionParts[0]>1||(versionParts[0]===1&&(versionParts[1]>9||(versionParts[1]===9&&versionParts[2]>=71)));
out.checks[12]={pass:freshEnough&&freshGrades.every(r=>r.losses.length===0)&&!reviewExposed&&reviewCaptures.length===0&&freshNumericFailures.length===0&&extendedLosses(fresh).length===0&&sourceChanges.length===0,version:freshInventory.openapiVersion,grades:freshGrades,reviewExposed,reviewCaptures,exclusionLimit:'The manifest excludes reviewSubmission. This does not prove safe ranking if exposed.',numericFailures:freshNumericFailures,extendedLosses:extendedLosses(fresh),sourceChanges,sequenceRow:allRows(fresh).find(r=>r.id==='q-pc-sequence-numbers-ordering-replace')};
out.checks[11]={rows:['What project categories does the Stellar ecosystem directory actually track — give me the controlled list of category values it uses.','ecosystem project category filter','directory project categories list','List the exact region values allowed by the project directory.'].map((query,i)=>({query,hits:hits(query),pass:has(query,i===3?'lumenloop.get_regions':'lumenloop.get_categories')}))};
out.checks[11].pass=out.checks[11].rows.every(r=>r.pass);
out.reviewSubmissionExposed=catalog.entries.some(e=>e.id==='scout.reviewSubmission');
out.shortTokenControls=[];
for(const [description,queries] of [["Return a city's forecast.",['send slack message']],['Return the forecast for a city.',['add alarm','archive all tasks']]]) for(const query of queries) {
 const entry={id:'weather.getForecast',name:'getForecast',service:'weather',kind:'operation',description};
 out.shortTokenControls.push({entry,query,gated:scoreEntry(entry,query),ungated:scoreEntryUngated(entry,query),weightedUngated:scoreEntryWeightedUngated(entry,query)});
}
{
 const entry={id:'billing.refundInvoice',name:'refundInvoice',service:'billing',kind:'operation',description:'Refund a re-billed invoice.'},query='read repository readme';
 out.shortTokenControls.push({entry,query,gated:scoreEntry(entry,query),ungated:scoreEntryUngated(entry,query),weightedUngated:scoreEntryWeightedUngated(entry,query)});
}
out.shortTokenPositives=out.shortTokenControls.map(({entry})=>({entry,query:entry.id,score:scoreEntryUngated(entry,entry.id)}));
out.source={scoringSha256:createHash('sha256').update(fs.readFileSync(resolve(sourceRoot,'src/catalog/scoring.ts'))).digest('hex'),manifestSha256:measured.manifest.sha256,sourceSnapshot:label.endsWith('fresh')?'fresh':'accepted',freshVersion:freshInventory.openapiVersion};
out.changedGradedRows=gradeChanges(baseline,measured);
// Save complete tier evidence and check result reproducibility against the measured rows.
const queries=new Map([...allCases,...read('eval/skills-cases.json').cases,...read('eval/holdout-cases.json').cases,...read('eval/protocol-history-cases.json').positiveCases,...read('eval/protocol-history-cases.json').controlCases].map(r=>[r.id,r.question]));
out.tiers={};
for(const lane of laneNames) {
 let gated=0,empty=0;
 for(const row of measured[lane]) {
  const query=queries.get(row.id); assert.ok(query, `Missing query ${row.id}`);
  const page=hits(query); assert.deepEqual(page.map(h=>({id:h.id,score:h.score})),row.topHits.map(h=>({id:h.id,score:h.score})), `Stale result ${row.id}`);
  const count=page.filter(h=>h.tier==='gated').length; gated+=count; if(count===0) empty++;
 }
 out.tiers[lane]={gated,rowsWithoutGated:empty};
}
assert.equal(Object.keys(out.checks).length,12);
out.allPass=Object.values(out.checks).every(check=>check.pass);
out.tokenization=tokenize('dApp iPhone eBay getForecast');
fs.writeFileSync(`${prefix}${label}-acceptance.json`,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({label,checks:Object.fromEntries(Object.entries(out.checks).map(([k,v])=>[k,v.pass])),rwaGroups:Object.fromEntries(['positives','ordinaryNegatives','deferredItFails'].map(key=>[key,{pass:out.checks[8][key].pass,failures:out.checks[8][key].rows.filter(row=>!row.pass).map(row=>row.query)}])),fixture:out.checks[8].fixture,weakGated:weakGated.map(({description,scoutGatedScore,docsUngatedScore,docsPresent})=>({description,scoutGatedScore,docsUngatedScore,docsPresent})),wholeWordDiagnostic:wholeWordDiagnostic.docsPresent},null,2));

process.exitCode=out.allPass?0:1;
