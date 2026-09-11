import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { totals, launchCsv, renderLaunch, launchMarkdown } from '../src/launch.js';

const data = JSON.parse(readFileSync(new URL('./launch-fixture.json', import.meta.url)));
test('launch report reconciles daily requests with independent monthly aggregates', () => {
  for (const month of data.months) assert.equal(month.days.reduce((sum, day) => sum + day.requests, 0), month.requests);
  assert.equal(totals(data).requests, 9);
});
test('recovered MCP totals exclude playground and do not add account counts', () => {
  assert.deepEqual(totals(data), { requests: 9, search: 2, execute: 3, accountsLowerBound: 2 });
});
test('missing months remain blank in CSV and unavailable in the report', () => {
  assert.match(launchCsv(data), /"2026-07","2","","","","Unavailable"/);
  assert.match(renderLaunch(data), /Complete lifetime tool counts and active-account totals remain unavailable/);
  assert.match(launchMarkdown(data), /not the full launch period/);
});
