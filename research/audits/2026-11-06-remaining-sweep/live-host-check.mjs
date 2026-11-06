import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {Client as LegacyClient} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport as LegacyTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {Client, StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
const credential=readFileSync(process.argv[2],'utf8').trim();
const rows=[];
for(const host of ['raven.stellar.org','raven.stellar.buzz','agents.stellar.buzz']) {
 const origin=`https://${host}`;
 const request=async(path,init={})=>fetch(origin+path,{...init,redirect:'manual'});
 for(const headers of [{},{Authorization:'Bearer deliberately-invalid'}]) {
  const r=await request('/mcp',{headers}); assert.equal(r.status,401);assert.match(r.headers.get('www-authenticate'),/Bearer/);assert.equal(r.headers.get('location'),null);
  rows.push({host,check:Object.keys(headers).length?'invalid-bearer':'unauthenticated-mcp',status:r.status});
 }
 for(const path of ['/.well-known/oauth-authorization-server','/.well-known/oauth-authorization-server/mcp','/.well-known/openid-configuration','/.well-known/openid-configuration/mcp']) {
  const r=await request(path);assert.equal(r.status,200);const b=await r.json();assert.equal(b.issuer,origin);assert.equal(b.token_endpoint,origin+'/token');assert.equal(b.authorization_endpoint,origin+'/authorize');assert.equal(b.registration_endpoint,origin+'/register');
  rows.push({host,check:path,status:r.status,issuer:b.issuer});
 }
 const r=await request('/.well-known/oauth-protected-resource/mcp');assert.equal(r.status,200);const b=await r.json();assert.equal(b.resource,origin+'/mcp');assert.deepEqual(b.authorization_servers,[origin]);rows.push({host,check:'protected-resource',resource:b.resource});
 for(const [version,C,T] of [['legacy-sdk-1.32.1',LegacyClient,LegacyTransport],['2026-07-28',Client,StreamableHTTPClientTransport]]) {
  const c=new C({name:'raven-release-check',version:'1.0.0'},version.startsWith('2026')?{versionNegotiation:{mode:{pin:version}}}:undefined);
  const transport=new T(new URL(origin+'/mcp'),{requestInit:{headers:{Authorization:`Bearer ${credential}`}}});
  try {await c.connect(transport); const list=await c.listTools();assert.deepEqual(list.tools.map(t=>t.name).sort(),['execute','search']);const result=await c.callTool({name:'search',arguments:{query:'soroban contract storage',limit:3}});assert.equal(result.isError??false,false);assert.ok(result.content?.length);rows.push({host,check:'authenticated-mcp',version,tools:list.tools.map(t=>t.name),searchOk:true});} finally {await c.close();}
 }
 for(const path of ['/','/docs','//evil.example/mcp?x=1']){
  const r=await request(path);if(host==='raven.stellar.org'){if(path!=='//evil.example/mcp?x=1')assert.equal(r.status,200);}else{assert.equal(r.status,308);assert.equal(r.headers.get('location'),'https://raven.stellar.org'+path);}rows.push({host,check:path,status:r.status,location:r.headers.get('location')});
 }
}
writeFileSync(process.argv[3],JSON.stringify({at:new Date().toISOString(),checks:rows},null,2)+'\n');console.log(`${rows.length} live host checks passed; both MCP wire generations negotiated on all three hosts.`);
