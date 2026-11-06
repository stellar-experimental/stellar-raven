import {writeFileSync} from 'node:fs';
import {parseEnvFile} from '../../../scripts/lib/shared.mjs';
const D='tmp/sweep-2026-11-06/other', env={...parseEnvFile('.env'),...process.env};
const tasks=[];const add=(id,tool,args)=>tasks.push({id,url:`https://api.lumenloop.com/v1/tools/${tool}`,method:'POST',args,auth:true});
for(const [c,id] of [['av',2207],['articles',5945],['events',1597],['events',1598],['events',1444],['research',66],['articles',6520],['research',141],['articles',8084],['articles',6461],['articles',8877],['events',1457],['articles',8228],['articles',5416],['articles',4809],['articles',8068],['articles',10190],['articles',99999999]])add(`doc-${c}-${id}`,'get_document',{collection:c,id});
add('regions','get_regions',{});
for(const entity of ['Denelle Dixon','Tyler van der Hoeven','Justin Rice','Stellar Development Foundation'])add(`entity-${entity}`,'find_content_by_entity',{entity,entity_type:entity==='Stellar Development Foundation'?'organization':'person',limit:5});
for(const slug of ['lobstr','moneygram','soroswap','wisdomtree','freighter','slender','xbull'])add(`project-${slug}`,'get_project',{slug});
for(const slug of ['blend','band','tucambio','usdc-swap','fastbuka','aquarius','soroswap','lobstr'])add(`scf-${slug}`,'get_scf_submissions',{slug});
for(const [id,query,types] of [['ranking','tokenized RWA stablecoin on-chain activity Stellar SDF report size volume',['research','articles']],['ranking-control','Q1 2026 quarterly report',['articles']],['roundup','Stellar Weekly Roundup week Jun 19 2026 May 29 RWA billion',['research']],['historical','Stellar 2014 fork Ripple consensus 2015 SCP',['articles','research']],['tyler','Tyler van der Hoeven',undefined],['negative','Strupey',undefined],['crdt','WisdomTree CRDT CRDYX private credit alternative income digital fund Stellar',undefined],['soroswap','Soroswap',undefined],['zipper','Zipper Protocol 27 activation', ['articles','research']],['meridian','Meridian 2026 Abu Dhabi Yas Marina Lisbon',['events','articles']],['bhopal','Bhopal Jabalpur Build On Stellar workshop',['events']]])add(id,'search_content_semantic',{query,...(types?{types}:{}),limit:10});
for(const query of ['Tyler van der Hoeven','passkeys smart wallets on Soroban','Stellar DEVCON 2024'])add(`av-${query}`,'find_av_passages',{query,limit:10});
for(const query of ['real-world assets on Stellar','CRDT','CRDYX','Benji','WisdomTree','Figure','Spiko','Etherfuse','varial','Blend','soroswap','xbull'])add(`directory-${query}`,'search_directory',{query,limit:query==='Blend'?20:10});
add('blend-limit1','search_directory',{query:'Blend',limit:1});
for(const sort of [undefined,'definitely_not_a_real_sort_key','zzz_not_a_field','last_seen_at','publishing_date'])add(`sort-${sort}`,'list_documents',{collection:'articles',...(sort?{sort}:{}),order:'DESC',limit:3});
for(const a of [{time_period:'upcoming'},{period:'upcoming'},{bogus_arg:'x'},{}])add(`unknown-${Object.keys(a)[0]}`,'list_documents',{collection:'events',limit:1,...a});
add('bogus-directory','search_directory',{query:'Blend',limit:1,bogus_arg:'x'});add('bogus-project','get_project',{slug:'blend',bogus_arg:'x'});
add('proposals','list_documents',{collection:'proposals',search:'onerror',limit:20});
add('search-id','search_documents',{collection:'articles',query:'2+ Years of Neural Quorum Governance',limit:5});
add('doc-string-id','get_document',{collection:'articles',id:'10190'});
for(const id of [10190,'10190',99999999,690])add(`related-${typeof id}-${id}`,'get_related_projects',{content_type:'article',content_id:id});
for(const tool of ['find_similar_projects_semantic','find_similar_scf_submissions'])add(tool,tool,{slug:'blend',limit:5});add('tags','get_tags_vocabulary',{});
for(const query of ['Zipper','Yas Marina','Abu Dhabi','CRDT','CRDYX'])add(`search-${query}`,'search_documents',{collection:['Yas Marina','Abu Dhabi'].includes(query)?'events':'articles',query,limit:10});
const out=[];
async function run(t){let result;for(let n=0;n<3;n++){try{const r=await fetch(t.url,{method:t.method||'GET',headers:{'Content-Type':'application/json',...(t.auth?{Authorization:`Bearer ${env.LUMENLOOP_API_KEY}`}:{})},body:t.args?JSON.stringify(t.args):undefined,signal:AbortSignal.timeout(45000)}); const text=await r.text();result={...t,at:new Date().toISOString(),status:r.status,body:JSON.parse(text)};if(r.status!==429&&r.status<500)break;}catch(e){result={...t,error:e.message}}}out.push(result);writeFileSync(`${D}/live.json`,JSON.stringify(out,null,2));}
let next=0;await Promise.all([0,1,2].map(async()=>{while(next<tasks.length)await run(tasks[next++])}));
// Restrict account metadata and authenticated inventory to counts and names only; discard bodies.
for(let pass=0;pass<2;pass++){
 const r=[];for(const [label,path,auth] of [['authenticated','tools',true],['anonymous','tools',false],['account','me',true]]){const res=await fetch(`https://api.lumenloop.com/v1/${path}`,{headers:auth?{Authorization:`Bearer ${env.LUMENLOOP_API_KEY}`}:{},signal:AbortSignal.timeout(30000)});const b=await res.json();const a=Array.isArray(b)?b:b.tools||b.data?.tools||b.data||[];r.push({label,status:res.status,...(path==='me'?{tools:b.tools||b.data?.tools}:{count:Array.isArray(a)?a.length:null,names:Array.isArray(a)?a.map(x=>x.name):[]})})}writeFileSync(`${D}/discovery-${pass}.json`,JSON.stringify({at:new Date().toISOString(),results:r},null,2));}
const res=await fetch('https://api.lumenloop.com/v1/tools');writeFileSync(`${D}/public-tools.json`,JSON.stringify(await res.json(),null,2));
console.log(`Completed ${out.length} free read-only calls; errors ${out.filter(x=>x.error||x.status>=500).length}`);
