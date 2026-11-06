// Independent free fixtures. Install SDK17.4.0 in an external directory; never under repo tmp.
// node this-file.mjs /tmp/raven-truth-2026-11-05-other
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const base=process.argv[2]+'/node_modules/@stellar/stellar-sdk/lib/esm/';
const sdk=await import(pathToFileURL(base+'index.js'));
const {parseRawSimulation,parseRawTransactions}=await import(pathToFileURL(base+'rpc/parsers.js'));
const url='https://developers.stellar.org/docs/build/guides/transactions/simulateTransaction-Deep-Dive.md';
const r=await fetch(url);assert.equal(r.status,200);const text=await r.text();
const start=text.indexOf('if (StellarRpc.Api.isSimulationError(sim))');assert(start>0);
const branch=text.slice(start,text.indexOf('```',start));
const run=new Function('sim','StellarRpc','scValToNative','console',branch);
const data=new sdk.SorobanDataBuilder().build().toXdr('base64');
const raw={id:'fixture',latestLedger:1,minResourceFee:'100',transactionData:data};
const value={xdr:sdk.nativeToScVal(7,{type:'u32'}).toXdr('base64'),auth:[]};
const preamble={transactionData:data,minResourceFee:'100'};
const rows=[];
for(const [name,extra,expected]of[
 ['error',{error:'original error'},0],['missing',{results:[]},0],
 ['value',{results:[value]},1],['void',{results:[{xdr:sdk.xdr.ScVal.scvVoid().toXdr('base64')}]},1],
 ['restore',{results:[value],restorePreamble:preamble},1],
 ['restore-missing-result',{restorePreamble:preamble},0]]){
 const sim=parseRawSimulation({...raw,...extra});let decodes=0;const logs=[];
 run(sim,sdk.rpc,v=>{decodes++;return sdk.scValToNative(v)},{log:(...x)=>logs.push(x),error:(...x)=>logs.push(x)});
 assert.equal(decodes,expected);if(name==='error')assert(logs.some(x=>x.includes('original error')));
 if(name==='restore'){assert(sdk.rpc.Api.isSimulationRestore(sim));assert(logs.some(x=>x[0]==='humanReadable Result:'&&x[1]===7));}
 if(name==='void')assert(logs.some(x=>x[0]==='humanReadable Result:'&&x[1]===null));
 rows.push({name,decodes,restore:sdk.rpc.Api.isSimulationRestore(sim),pass:true});
}
const meta=sdk.xdr.TransactionMeta.operations([]).toXdr('base64');
const tx=new sdk.TransactionBuilder(new sdk.Account(sdk.Keypair.fromRawEd25519Seed(new Uint8Array(32)).publicKey(),'0'),{fee:'100',networkPassphrase:sdk.Networks.TESTNET}).setTimeout(0).addOperation(sdk.Operation.manageData({name:'fixture',value:'readonly'})).build();
const result=new sdk.xdr.TransactionResult({feeCharged:100n,result:sdk.xdr.TransactionResultResult.txSuccess([]),ext:sdk.xdr.TransactionResultExt.v0()}).toXdr('base64');
const parsed=parseRawTransactions({status:'SUCCESS',ledger:1,createdAt:1,applicationOrder:1,feeBump:false,envelopeXdr:tx.toXDR(),resultXdr:result,resultMetaXdr:meta});
assert.equal(parsed.resultMetaXdr.type,'operations');
assert.throws(()=>sdk.xdr.TransactionResultMeta.fromXdr(meta,'base64'));
console.log(JSON.stringify({sdk:'17.4.0',url,preview:rows,metadata:{actualSDKParser:true,TransactionMetaAccepted:true,TransactionResultMetaRejected:true},network:'only GET public Docs; no RPC/signing/submission'},null,2));
