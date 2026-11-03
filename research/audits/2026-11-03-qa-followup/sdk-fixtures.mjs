import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Run with an isolated SDK installation and a new receipt path.
const [sdkRootArg, output] = process.argv.slice(2);
assert.ok(sdkRootArg && output, "expected SDK directory and output file");
const sdkRoot = path.resolve(sdkRootArg);
const pkg = JSON.parse(readFileSync(path.join(sdkRoot, "package.json")));
assert.equal(pkg.version, "17.4.0");
const sdk = await import(pathToFileURL(path.join(sdkRoot, "lib/esm/index.js")));
const { xdr, contract, rpc, scValToNative, SorobanDataBuilder } = sdk;
const checks = [];
function check(id, fn) {
  const observation = fn();
  checks.push({ id, passed: true, observation });
}

function publishedPreview(sim) {
  return scValToNative(sim.result?.retval);
}
function guardedPreview(sim) {
  if (rpc.Api.isSimulationError(sim)) return { status: "error", error: sim.error };
  if (rpc.Api.isSimulationRestore(sim)) return { status: "restore" };
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result?.retval) return { status: "no-result" };
  return { status: "success", value: scValToNative(sim.result.retval) };
}
const success = {
  _parsed: true, transactionData: new SorobanDataBuilder(), minResourceFee: "0",
  result: { auth: [], retval: xdr.ScVal.scvU32(7) }
};
check("sd-089-error-path", () => {
  const sim = { error: "fixture simulation error" };
  assert.throws(() => publishedPreview(sim), TypeError);
  assert.deepEqual(guardedPreview(sim), { status: "error", error: sim.error });
  return "The original decode throws; the guard preserves the simulation error.";
});
check("sd-089-restore-path", () => {
  const sim = { _parsed: true, transactionData: new SorobanDataBuilder(),
    restorePreamble: { transactionData: new SorobanDataBuilder() } };
  assert.throws(() => publishedPreview(sim), TypeError);
  assert.deepEqual(guardedPreview(sim), { status: "restore" });
  return "Restoration remains distinct from an invocation result.";
});
check("sd-089-success-and-missing-result", () => {
  assert.equal(publishedPreview(success), 7);
  assert.deepEqual(guardedPreview(success), { status: "success", value: 7 });
  assert.deepEqual(guardedPreview({ _parsed: true, transactionData: new SorobanDataBuilder() }), { status: "no-result" });
  assert.deepEqual(guardedPreview({ ...success, result: { auth: [], retval: xdr.ScVal.scvVoid() } }),
    { status: "success", value: null });
  return "The guard retains successful values, including a valid void return.";
});

const unionEntry = xdr.ScSpecEntry.scSpecEntryUdtUnionV0(new xdr.ScSpecUdtUnionV0({
  doc: "", lib: "", name: "TaggedEnum", cases: [
    xdr.ScSpecUdtUnionCaseV0.scSpecUdtUnionCaseVoidV0(new xdr.ScSpecUdtUnionCaseVoidV0({ doc: "", name: "A" })),
    xdr.ScSpecUdtUnionCaseV0.scSpecUdtUnionCaseTupleV0(new xdr.ScSpecUdtUnionCaseTupleV0({ doc: "", name: "B",
      type: [xdr.ScSpecTypeDef.scSpecTypeU32()] }))
  ]
}));
const enumEntry = xdr.ScSpecEntry.scSpecEntryUdtEnumV0(new xdr.ScSpecUdtEnumV0({
  doc: "", lib: "", name: "NumberEnum",
  cases: [new xdr.ScSpecUdtEnumCaseV0({ doc: "", name: "A", value: 1 }),
    new xdr.ScSpecUdtEnumCaseV0({ doc: "", name: "B", value: 2 })]
}));
// Serialize and reload the specifications instead of relying on unchecked object shapes.
const spec = new contract.Spec([unionEntry.toXdr("base64"), enumEntry.toXdr("base64")]);
const taggedType = xdr.ScSpecTypeDef.scSpecTypeUdt(new xdr.ScSpecTypeUdt({ name: "TaggedEnum" }));
const numberType = xdr.ScSpecTypeDef.scSpecTypeUdt(new xdr.ScSpecTypeUdt({ name: "NumberEnum" }));
check("sd-090-selected-tagged-variants", () => {
  for (const native of [{ tag: "A" }, { tag: "B", values: [0] }]) {
    const encoded = spec.nativeToScVal(native, taggedType);
    assert.deepEqual(spec.scValToNative(xdr.ScVal.fromXdr(encoded.toXdr("base64"), "base64"), taggedType), native);
    assert.equal(encoded.value.length, native.tag === "A" ? 1 : 2);
  }
  return "A and B encode separately as a symbol-led vector.";
});
check("sd-090-noncanonical-combined-example", () => {
  const combined = xdr.ScVal.scvVec([xdr.ScVal.scvSymbol("A"), xdr.ScVal.scvMap([
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("B"), val: xdr.ScVal.scvU32(0) })
  ])]);
  const decoded = spec.scValToNative(combined, taggedType);
  assert.deepEqual(decoded, { tag: "A" });
  const canonical = spec.nativeToScVal(decoded, taggedType);
  assert.notEqual(canonical.toXdr("base64"), combined.toXdr("base64"));
  return "This SDK decoder ignores the trailing map for A; it does not decode both variants.";
});
check("sd-090-integer-enum", () => {
  for (const value of [1, 2]) {
    const encoded = spec.nativeToScVal(value, numberType);
    assert.equal(encoded.type, "scvU32");
    assert.equal(spec.scValToNative(encoded, numberType), value);
  }
  assert.throws(() => spec.scValToNative(xdr.ScVal.scvVec([xdr.ScVal.scvU32(0), xdr.ScVal.scvU32(0)]), numberType));
  assert.throws(() => spec.nativeToScVal(0, numberType));
  return "Declared values encode as one u32; the published vector is rejected.";
});

const { Account, Contract, Networks, Operation, StrKey, TransactionBuilder, BASE_FEE } = sdk;
function transaction(operations) {
  const builder = new TransactionBuilder(new Account(contract.NULL_ACCOUNT, "0"),
    { fee: BASE_FEE, networkPassphrase: Networks.TESTNET });
  for (const operation of operations) builder.addOperation(operation);
  return builder.setTimeout(0).build();
}
const invoke = new Contract(StrKey.encodeContract(new Uint8Array(32))).call("fixture");
check("sk-037-mixed-operation-rejection", () => {
  const mixed = transaction([invoke, Operation.manageData({ name: "fixture", value: "local" })]);
  assert.equal(mixed.operations.length, 2);
  assert.throws(() => rpc.assembleTransaction(mixed, success), /must contain exactly one/);
  const wrapped = TransactionBuilder.buildFeeBumpTransaction(contract.NULL_ACCOUNT, BASE_FEE, mixed, Networks.TESTNET);
  assert.throws(() => rpc.assembleTransaction(wrapped, success), /must contain exactly one/);
  return "The SDK rejects mixed inner operations, including a fee-bump wrapper.";
});
check("sk-037-single-operation-control", () => {
  const assembled = rpc.assembleTransaction(transaction([invoke]), success).build();
  assert.equal(assembled.operations.length, 1);
  return "The same fixture assembles one supported invocation successfully.";
});

const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const sources = ["package.json", "lib/esm/rpc/api.js", "lib/esm/rpc/transaction.js", "lib/esm/contract/spec.js"]
  .map((relativePath) => ({ relativePath, sha256: sha(readFileSync(path.join(sdkRoot, relativePath))) }));
const receipt = {
  schema: "golden-followup-sdk-fixtures-v1", executedAt: new Date().toISOString(),
  nodeVersion: process.version, sdk: { name: pkg.name, version: pkg.version, sources },
  fixtureSha256: sha(readFileSync(new URL(import.meta.url))), checks,
  networkCalls: 0, modelCalls: 0, simulations: 0, signedTransactions: 0, submittedTransactions: 0,
  limits: ["Local JavaScript SDK behavior only; no on-chain contract decoder ran.",
    "Python, Java and PHP examples were not executed.",
    "The tagged decoder accepts trailing data for a void variant; this is recorded, not hidden."]
};
writeFileSync(output, `${JSON.stringify(receipt, null, 2)}\n`, { flag: "wx" });
console.log(`${checks.length} local SDK fixtures passed.`);
