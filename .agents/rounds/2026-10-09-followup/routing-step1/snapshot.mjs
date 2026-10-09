import fs from 'node:fs';
import assert from 'node:assert/strict';
const mode=process.argv[2];
assert.ok(['accepted','fresh'].includes(mode));
const root='tmp/routing3/';
const inventory=mode==='accepted'?`${root}accepted/inventory`:`${root}fresh-inventory`;
fs.cpSync(inventory,'inventory',{recursive:true});
let policy=fs.readFileSync(`${root}accepted/src/policy/scout-exposure.ts`,'utf8');
if(mode==='fresh') {
 const entry='  ["GET /api/hackathons/review", "reviewSubmission"]';
 assert.equal(policy.split(entry).length,2);
 policy=policy.replace(entry,'');
 policy=policy.replace('export const EXCLUDED_SCOUT_OPERATIONS = new Map([','export const EXCLUDED_SCOUT_OPERATIONS = new Map([\n'+entry+',');
}
fs.writeFileSync('src/policy/scout-exposure.ts',policy);
console.log(`Restored ${mode} snapshot. reviewSubmission remains excluded.`);
