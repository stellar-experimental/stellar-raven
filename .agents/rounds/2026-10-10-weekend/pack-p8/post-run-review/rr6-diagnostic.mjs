import fs from 'node:fs';
import {packSourceEvidenceText,findTranscriptEvidencePackOmissions,buildTranscriptEvidencePack} from '../eval/qa/evidence-pack.mjs';
const src=fs.readFileSync('eval/qa/evidence-pack.mjs','utf8').replace('|sourceItems:|truncation:', '|sourceItems:|provenance:|truncation:').replace('kept.push(indented ? indented[1] : line);','kept.push(indented ? indented[1] : line.startsWith("canonicalUrls:") ? line.replace(/ \\(\\+\\d+ more\\)/g, "") : line);');
const fixed=await import(`data:text/javascript;base64,${Buffer.from(src).toString('base64')}`);
const out={compared:0,changes:[],packChanged:[],keptProvenance:0,keptMore:0};
const rows=JSON.parse(fs.readFileSync('tmp/rr6-audit.json')).paired;
for(const row of rows)for(const arm of ['A','B']) {
 const pre=`tmp/rr6-${row.invocation}-${arm}-${row.id}`,input=JSON.parse(fs.readFileSync(pre+'-input.json')),pack=fs.readFileSync(pre+'-pack.txt','utf8');
 if(arm==='B') {
  if(/^provenance:/m.test(packSourceEvidenceText(pack)))out.keptProvenance++;
  if(/^canonicalUrls:.*\(\+\d+ more\)/m.test(packSourceEvidenceText(pack)))out.keptMore++;
  if(fixed.buildTranscriptEvidencePack(input)!==pack)out.packChanged.push(row.id);
 }
 for(const [index,v] of row[arm].verdicts.entries()) {
  if(!v.wrongClaims?.length)continue;
  const args={transcript:input.transcript,transcriptEvidence:pack,claims:v.wrongClaims};
  const before=findTranscriptEvidencePackOmissions(args),after=fixed.findTranscriptEvidencePackOmissions(args);out.compared++;
  if(JSON.stringify(before)!==JSON.stringify(after))out.changes.push({id:row.id,arm,index,before,after});
 }
}
fs.writeFileSync('tmp/rr6-diagnostic.json',JSON.stringify(out,null,2));console.log(out);
