import fs from 'node:fs';
let code=fs.readFileSync('/Users/kalepail/Desktop/raven-p7-arm/eval/qa/evidence-pack.mjs','utf8');
code+='\nexport {executeEntries,claimSupportInputs,selectSupportUnits};';
const m=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const input=JSON.parse(fs.readFileSync('tmp/rr3-S2c-B-q-hist-quantum-preparedness-plan-input.json'));
const s=m.claimSupportInputs({...input,entries:m.executeEntries(input.transcript)});
const target=s.segments.filter(s=>s.text.includes('migrate immediately'));
console.log('TARGET',target);
console.log('IMMEDIATE ANCHORS',s.anchors.filter(a=>/immediate/i.test(a.value)));
for(const t of target) {
 console.log('TARGET OCCURRENCES',s.bySegment.get(t.index)?.map(o=>({anchor:s.anchors[o.anchorId].value,start:o.start,end:o.end})));
}
for(const spanChars of [440,120]){
 const u=m.selectSupportUnits({...s,spanChars});
 console.log('SPAN',spanChars,'UNITS',u.units.length,'HIT',u.units.map((u,i)=>({index:i,span:u.span,primary:s.anchors[u.primary].value})).filter(u=>/migrate immediately/.test(u.span)));
}
for(const maxChars of [12000,100000]){
 const pack=m.buildTranscriptEvidencePack({...input,maxChars});
 console.log('BUDGET',maxChars,'CHARS',pack.length,'HOLDS',pack.includes('migrate immediately'));
}
