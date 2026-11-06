import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
const read = (name) => JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8'));
const contract = read('live-contract.json');
const receipt = read('validation.json');
assert.equal(contract.sha256, receipt.sha256);
assert.deepEqual(contract.response502, receipt.response);
assert.deepEqual(contract.ErrorResponse, receipt.referencedSchema);
const validate = new Ajv2020({strict: false, allErrors: true}).compile({
  ...contract.response502.content['application/json'].schema,
  components: {schemas: {ErrorResponse: contract.ErrorResponse}},
});
for (const fixture of receipt.checks) assert.equal(validate(fixture.body), fixture.expected, fixture.name);
console.log('Six archived schema fixtures passed; no network or model request.');
