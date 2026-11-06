// Execute newly captured Docs snippets against local fixtures only.
// npm install --prefix /tmp/raven-docs-sweep-sdk --ignore-scripts @stellar/stellar-sdk@17.4.0 typescript@5.9.3
// node research/audits/2026-11-06-remaining-sweep/docs-sdk.mjs
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
const req=createRequire('/tmp/raven-docs-sweep-sdk/package.json');const sdk=req('@stellar/stellar-sdk');const ts=req('typescript');
const dir='tmp/sweep-2026-11-06/docs/';const read=(id,i=0)=>readFileSync(`${dir}live-${id}-${i}.body`,'utf8');
const blocks=t=>[...t.matchAll(/```(?:typescript|javascript|ts)[^\n]*\n([\s\S]*?)```/g)].map(m=>m[1]);
const rows=[];
for(let i=0;i<2;i++){
 const block=blocks(read('sd-081',i)).find(b=>b.includes('function getWasmLedgerKey'));
 const d=ts.transpileModule(block,{reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022}}).diagnostics;
 rows.push({id:'sd-081',page:i,diagnostics:d.map(x=>({code:x.code,message:ts.flattenDiagnosticMessageText(x.messageText,' ')})),hasTimeout:block.includes('.setTimeout(30)'),missingXdrImport:!block.match(/import\s*{[^}]*\bxdr\b/s),responseAsKey:block.includes('wasmEntry'),obsoleteGetter:block.includes('entry.val().instance().wasmHash()')});
}
const helper=blocks(read('sd-081',3)).find(b=>b.includes('async function submitTx'));const restore=blocks(read('sd-081',2)).find(b=>b.includes('const { Api, assembleTransaction }'));
const target='/tmp/raven-docs-sweep-sdk/restore-combined.ts';writeFileSync(target,helper+'\n'+restore);
const program=ts.createProgram([target],{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,noEmit:true,skipLibCheck:true});
rows.push({id:'sd-081',case:'combined helper + restore-data',diagnostics:ts.getPreEmitDiagnostics(program).filter(d=>d.file?.fileName===target).map(d=>({code:d.code,message:ts.flattenDiagnosticMessageText(d.messageText,' ')}))});
const account=new sdk.Account(sdk.contract.NULL_ACCOUNT,'0');
const tx=new sdk.TransactionBuilder(account,{fee:'100',networkPassphrase:sdk.Networks.TESTNET}).setTimeout(30).setSorobanData(new sdk.SorobanDataBuilder().build()).addOperation(sdk.Operation.invokeContractFunction({contract:'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',function:'symbol',args:[]})).build();
for(let i=0;i<2;i++){
 const expression=read('sd-058',i).match(/const sorobanData = ([^;]+);/)[1];let error=null;
 try{new Function('tx','txEnvelope',`return ${expression}`)(tx,sdk.xdr.TransactionEnvelope.fromXDR(tx.toXDR(),'base64'));}catch(e){error=e.toString()}
 rows.push({id:'sd-058',page:i,expression,error});
}
const served=blocks(read('sd-091')).find(b=>b.includes('async function simulateTransaction'));
const functionBody=served.slice(0,served.indexOf('// Example XDR'));
for(const [name,value]of Object.entries({success:{jsonrpc:'2.0',result:{latestLedger:1}},rpcError:{jsonrpc:'2.0',error:{code:-32600,message:'Invalid request'}},simulationError:{jsonrpc:'2.0',result:{error:'HostError fixture'}}})){
 let calls=0,error=null;const logs=[];
 const fn=new Function('fetch','console',functionBody+';return simulateTransaction;')(async()=>{calls++;return {json:async()=>value}},{log:v=>logs.push(v)});
 try{await fn('unused-local-fixture')}catch(e){error=e.toString()}
 rows.push({id:'sd-091',case:name,fixtureFetchCalls:calls,error,logs});
}
const result={observedAt:new Date().toISOString(),sdk:'17.4.0',typescript:'5.9.3',networkCalls:0,signedTransactions:0,submittedTransactions:0,rows};
writeFileSync(dir+'sdk-receipts.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
