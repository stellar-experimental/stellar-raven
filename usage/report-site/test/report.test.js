import test from 'node:test';
import assert from 'node:assert/strict';
import { bounds, countsSql, receiptsSql } from '../cloudflare/worker.js';
import worker from '../cloudflare/worker.js';
import { monthly, availableMonths, csv, expectedChecks } from '../public/app.js';
import site from '../src/server.js';

const data = {
  archiveStart: '2026-09-11T14:34:59.000Z', retainedFrom: '2025-09-01T00:00:00.000Z',
  generatedAt: '2026-09-11T16:30:00.000Z',
  receipts: [{ day: '2026-09-11', canary_hours: 2, truncated_invocations: 0 }],
  months: [{ period: '2026-09', surface: 'all', total_responses: 4, search_responses: 2, execute_responses: 2, unique_accounts: 1 }]
};
test('thirteen calendar months span year boundaries', () => {
  assert.equal(new Date(bounds(new Date('2027-01-31T23:59:59Z')).start).toISOString(), '2026-01-01T00:00:00.000Z');
});
test('missing months remain unavailable and CSV leaves counts blank', () => {
  assert.deepEqual(availableMonths(data), ['2026-09', '2026-08', '2026-07']);
  assert.equal(monthly(data, '2026-08', 'mcp').total_responses, undefined);
  assert.match(csv(data, 'mcp'), /"2026-08","mcp","","","",""/);
});
test('combined account counts come from distinct database counts', () => {
  assert.equal(monthly(data, '2026-09', 'all').unique_accounts, 1);
  assert.equal(monthly(data, '2026-09', 'playground').total_responses, 0);
});
test('expected collection checks exclude the period before collection began', () => {
  assert.equal(expectedChecks(data, '2026-09'), 2);
  assert.equal(expectedChecks(data, '2026-08'), 0);
});
test('report endpoint rejects missing and incorrect credentials before reading D1', async () => {
  const env = { REPORT_TOKEN: 'test-only-token', USAGE: { prepare() { throw new Error('must not query'); } } };
  for (const [path, authorization] of ['/report','/launch'].flatMap(path => ['', 'Bearer incorrect'].map(auth => [path, auth]))) {
    const response = await worker.fetch(new Request('https://report.example' + path, { headers: { authorization } }), env, {});
    assert.equal(response.status, 401);
  }
});
test('endpoint cannot accept arbitrary paths, methods, or query parameters', async () => {
  const env = { REPORT_TOKEN: 'test-only-token' };
  for (const [path, method, status] of [['/report?sql=DELETE', 'GET', 404], ['/other', 'GET', 404], ['/report', 'POST', 405]]) {
    const response = await worker.fetch(new Request('https://report.example' + path, { method, headers: { Authorization: 'Bearer test-only-token' } }), env, {});
    assert.equal(response.status, status);
  }
});
test('SQL uses only fixed aggregate queries', () => {
  assert.throws(() => countsSql("'); DELETE FROM usage_responses; --"));
  for (const sql of [countsSql('%Y-%m'), countsSql('%Y-%m-%d'), receiptsSql]) {
    assert.doesNotMatch(sql, /\b(INSERT|UPDATE|DELETE|DROP)\b/);
    assert.match(sql, /timestamp_ms >= \?1 AND timestamp_ms < \?2/);
  }
});
test('site fails closed without the server-side report connection', async () => {
  const response = await site.fetch(new Request('https://site.example/api/report'), {});
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('launch snapshots require authentication and an unexpired database record', async () => {
  let query;
  const env = { REPORT_TOKEN: 'test-only-token', USAGE: { prepare(sql) {
    query = sql; return { bind(now) { assert.ok(now > 0); return { async first() { return { data_json: '{"synthetic":true}' }; } }; } };
  } } };
  const response = await worker.fetch(new Request('https://report.example/launch', { headers: { Authorization: 'Bearer test-only-token' } }), env, {});
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await response.json(), { synthetic: true });
  assert.match(query, /expires_at_ms > \?1/);
});

test('missing or expired historical snapshots return 404 without a payload', async () => {
  const env = { REPORT_TOKEN: 'test-only-token', USAGE: { prepare() { return { bind() { return { async first() { return null; } }; } }; } } };
  const response = await worker.fetch(new Request('https://report.example/launch', { headers: { Authorization: 'Bearer test-only-token' } }), env, {});
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(await response.text(), 'Snapshot unavailable');
});
