// Free, read-only SDK checks of freshly served Docs snippets. No RPC/signing/submission.
// Setup externally: npm install --prefix /tmp/docs-sdk-check --ignore-scripts @stellar/stellar-sdk@17.4.0 typescript@5.9.3
// Run: node research/audits/2026-11-05-improvements/docs-sdk-recheck.mjs /tmp/docs-sdk-check
import {createRequire}from'node:module';
const require=createRequire(`${process.argv[2] || '/tmp/docs-sdk-check'}/package.json`);
const sdk=require('@stellar/stellar-sdk');const ts=require('typescript');
const paths={
 'sd-089':['build/guides/transactions/simulateTransaction-Deep-Dive'],
 'sd-081':['build/guides/archival/restore-contract-js','learn/fundamentals/contract-development/storage/state-archival'],
 'sd-091':['build/guides/transactions/simulateTransaction-Deep-Dive']
};const d={};const bodies=new Map();
for(const [id,ps]of Object.entries(paths)){d[id]=[];for(const p of ps){const url=`https://developers.stellar.org/docs/${p}.md`;if(!bodies.has(url)){const r=await fetch(url);if(!r.ok)throw Error(`GET ${r.status}: ${url}`);bodies.set(url,await r.text());}d[id].push({url,file:url});}}
const page=id=>bodies.get(d[id][0].url);const rows=[];
const text=page('sd-089');const branch=text.slice(text.indexOf('if (StellarRpc.Api.isSimulationError(sim))'),text.indexOf('```',text.indexOf('if (StellarRpc.Api.isSimulationError(sim))')));
const run=new Function('sim','StellarRpc','scValToNative','console',branch);
for(const [name,sim]of Object.entries({error:{error:'original error'},missing:{transactionData:{}},value:{transactionData:{},result:{retval:sdk.nativeToScVal(7,{type:'u32'})}},void:{transactionData:{},result:{retval:sdk.xdr.ScVal.scvVoid()}},restore:{transactionData:{},restorePreamble:{transactionData:{}},result:{retval:sdk.nativeToScVal(7,{type:'u32'})}}})){
 const logs=[];let decodes=0;let error=null;try{run(sim,sdk.rpc,v=>{decodes++;return sdk.scValToNative(v)},{log:(...x)=>logs.push(x),error:(...x)=>logs.push(x)})}catch(e){error=e.message}rows.push({id:'sd-089',name,decodes,error,logs,restore:sdk.rpc.Api.isSimulationRestore(sim)});
}
const payer= sdk.Keypair.random();const tx=new sdk.TransactionBuilder(new sdk.Account(payer.publicKey(),'0'),{fee:'100',networkPassphrase:sdk.Networks.TESTNET}).setTimeout(30).setSorobanData(new sdk.SorobanDataBuilder().build()).addOperation(sdk.Operation.invokeContractFunction({contract:'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',function:'symbol',args:[]})).build();
for(const [n,expr]of [['fee','txEnvelope.v1()?.tx()?.ext()?.sorobanData()'],['x402','tx.toEnvelope().v1()?.tx()?.ext()?.sorobanData()']]){try{new Function('tx','txEnvelope',`return ${expr}`)(tx,sdk.xdr.TransactionEnvelope.fromXDR(tx.toXDR(),'base64'));rows.push({id:'sd-058',n,error:null})}catch(e){rows.push({id:'sd-058',n,error:e.message})}}
for(const r of d['sd-081'].slice(0,2)){const t=bodies.get(r.url);const blocks=[...t.matchAll(/```(?:typescript|ts|javascript)[^\n]*\n([\s\S]*?)```/g)].map(m=>m[1]);const block=blocks.find(b=>b.includes('function getWasmLedgerKey'));const out=ts.transpileModule(block,{reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022}});rows.push({id:'sd-081',url:r.url,diagnostics:out.diagnostics.map(x=>({code:x.code,message:ts.flattenDiagnosticMessageText(x.messageText,' ')}))})}
const f=page('sd-091');const body=f.slice(f.indexOf('async function simulateTransaction'),f.indexOf('```',f.indexOf('async function simulateTransaction')));
for(const value of [{jsonrpc:'2.0',result:{latestLedger:1}},{jsonrpc:'2.0',error:{code:-1,message:'error'}}]){try{const response={json:async()=>value};const result=await response.json();JSON.parse(result);rows.push({id:'sd-091',error:null})}catch(e){rows.push({id:'sd-091',inputKind:'result'in value?'success':'error',error:e.name})}}
console.log(JSON.stringify(rows,null,2));
