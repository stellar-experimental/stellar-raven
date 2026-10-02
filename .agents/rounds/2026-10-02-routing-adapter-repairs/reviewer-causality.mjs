import fs from 'node:fs';
import {loadManifest,searchCatalog} from './candidate/src/catalog/search.ts';
import {RUNNERS} from './candidate/src/skills/runners/index.ts';
import {validateArgs} from './candidate/src/policy/validate.ts';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const base=read('./base/catalog/manifest.json'), candidate=read('./candidate/catalog/manifest.json');
const queries=['How do x402, MPP, AP2, and ACP compare for agent payments, and which are Stellar-specific vs general?','Stellar skills for signing messages','Stellar skills for security auditing','Are there any model context protocol skills for Stellar?'];
const cases={base,candidate};
for(const word of ['x402','pay','apis','skills','messages','security']){const m=structuredClone(candidate);for(const e of m.entries)if(e.service==='stellarDocs'&&e.keywords&&!(base.entries.find(o=>o.id===e.id).keywords??[]).includes(word))e.keywords=e.keywords.filter(x=>x!==word);cases['without-new-'+word]=m;}
const description=structuredClone(candidate);description.entries.find(e=>e.id==='scout.listSkills').description=base.entries.find(e=>e.id==='scout.listSkills').description;cases['old-listSkills-description']=description;
const results=queries.map(query=>({query,variants:Object.fromEntries(Object.entries(cases).map(([name,m])=>[name,searchCatalog(loadManifest(m),{query,limit:5}).map(({id,score,tier})=>({id,score,tier}))]))}));
fs.writeFileSync(new URL('./causality.json',import.meta.url),JSON.stringify(results,null,2));
for(const r of results){console.log(r.query);for(const [n,v] of Object.entries(r.variants))console.log(n,v.map(e=>e.id+':'+e.score).join(' | '));}
const a=read('./base/inventory/stellar-light.json').openapi,b=read('./candidate/inventory/stellar-light.json').openapi;
const touched=[];for(const [p,methods]of Object.entries(b.paths))for(const [m,op]of Object.entries(methods))if(JSON.stringify(a.paths[p]?.[m])!==JSON.stringify(op))touched.push('scout.'+op.operationId);
console.log('RUNNERS',Object.fromEntries(Object.entries(RUNNERS).map(([id,r])=>[id,{ops:r.ops,intersection:r.ops.filter(op=>touched.includes(op))}])));
console.log('COMMA SOURCE',validateArgs(candidate.entries.find(e=>e.id==='scout.searchResearch').inputSchema,{q:'base reserve',source:'cap,sep',perSource:2}));
