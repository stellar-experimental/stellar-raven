import fs from 'node:fs';
import {findTranscriptEvidencePackOmissions as check} from '/Users/kalepail/Desktop/raven-p7-arm/eval/qa/evidence-pack.mjs';
const x=JSON.parse(fs.readFileSync('tmp/rr3-audit.json'));
const replay=JSON.parse(fs.readFileSync('tmp/rr3-omissions.json'));
for(const r of x.paired.filter(r=>r.invocation[1]==='1')){
 const input=JSON.parse(fs.readFileSync(r.B.file+'-input.json'));
 const p=fs.readFileSync(r.B.file+'-pack.txt','utf8');
 const listed=replay.rows.find(t=>t.id===r.id&&t.stored.packVersion==='p6');
 console.log(r.id);
 for(const c of listed.claims){
  const probes=check({transcript:input.transcript,transcriptEvidence:p.replace(/^claimSupportOmitted:.*$/mg,''),claims:[c.claim]});
  console.log(JSON.stringify({claim:c.claim,missingWithoutOmissionLine:probes}));
 }
}
