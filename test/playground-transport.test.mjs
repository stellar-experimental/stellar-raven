import { fork, spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { afterEach, describe, expect, it } from 'vitest';
import { runCase } from '../scripts/run-playground-semantic-eval.mjs';

// A separate process must be able to close idle sockets while the runner is blocked.
const serverSource = `
const http = require('node:http');
let id = 0;
let mode = 'ok';
const requests = [];
const server = http.createServer(async (req, res) => {
  const parts = []; for await (const part of req) parts.push(part);
  requests.push({ socket: req.socket.id, method: req.method, url: req.url,
    httpVersion: req.httpVersion, rawHeaders: req.rawHeaders, body: Buffer.concat(parts).toString(),
    wire: Buffer.concat(req.socket.raw).toString() });
  req.socket.raw = [];
  if (mode === 'reset') return req.socket.destroy();
  if (Buffer.concat(parts).toString() === '{}') { res.statusCode = 400; return res.end('invalid fixture body'); }
  res.setHeader('content-type', 'text/event-stream');
  if (mode === 'stream-reset') res.setHeader('content-length', '10000');
  if (req.headers.connection !== 'close') res.setHeader('connection', 'keep-alive');
  res.write('data: {"type":"ready"}\\n\\n');
  if (mode === 'stream-reset') return setTimeout(() => req.socket.destroy(), 10);
  setTimeout(() => res.end('data: {"type":"token","text":"fixture answer"}\\n\\n' +
    'data: {"type":"done","reason":"stop"}\\n\\n' +
    'data: {"type":"eval-cost","costUsd":0}\\n\\n'), 10);
});
server.keepAliveTimeout = 500;
server.keepAliveTimeoutBuffer = 0;
server.on('connection', socket => { socket.id = ++id; socket.raw = []; socket.on('data', chunk => socket.raw.push(chunk)); });
process.on('message', message => {
  if (message === 'requests') process.send(requests);
  else { mode = message; process.send('mode-set'); }
});
server.listen(0, '127.0.0.1', () => process.send('http://127.0.0.1:' + server.address().port + '/playground/chat'));
`;
const children = new Set();
afterEach(async () => {
  await Promise.all([...children].map(async child => {
    if (child.exitCode !== null || child.signalCode !== null) { children.delete(child); return; }
    const ended = once(child, 'exit');
    child.kill();
    await ended;
    children.delete(child);
  }));
});
async function server() {
  const child = fork('-e', [serverSource], { execArgv: [], silent: true });
  children.add(child);
  const [endpoint] = await once(child, 'message');
  return { endpoint, mode: async mode => {
    const response = once(child, 'message'); child.send(mode); await response;
  }, requests: async () => {
    const response = once(child, 'message'); child.send('requests'); return (await response)[0];
  } };
}
const item = { question: 'A credential-free transport fixture.' };
const options = endpoint => ({ endpoint, cookie: 'synthetic=no-secret', maxBudgetUsd: 1, timeoutMs: 3000 });
function judgeBlock(ms) {
  const result = spawnSync(process.execPath, ['-e', `Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ${ms})`]);
  expect(result.status).toBe(0);
}

describe('Playground answer HTTP transport', () => {
  it('does not reuse an idle socket across synchronous judging, without a scheduling yield', async () => {
    const fixture = await server();
    const rows = [];
    for (let index = 0; index < 4; index++) {
      rows.push(await runCase(item, options(fixture.endpoint)));
      if (index < 3) judgeBlock(index === 0 ? 0 : 800);
    }
    expect(rows.map(row => row.clientError)).toEqual([null, null, null, null]);
    expect(rows.every(row => row.responseStatus === 200 && row.costUsd === 0 && row.finishReason === 'stop')).toBe(true);
    const requests = await fixture.requests();
    expect(requests).toHaveLength(4);
    expect(new Set(requests.map(request => request.socket)).size).toBe(4);
    expect(requests.every(request => request.rawHeaders.includes('close'))).toBe(true);
  }, 15000);

  it('changes only the Connection header on the wire and consumes the cost frame after done', async () => {
    const fixture = await server();
    const config = options(fixture.endpoint);
    // The prior request shape, including automatically generated HTTP headers.
    const response = await fetch(fixture.endpoint, {
      method: 'POST', headers: { 'content-type': 'application/json', origin: new URL(fixture.endpoint).origin,
        'sec-fetch-site': 'same-origin', cookie: config.cookie, 'x-raven-eval-max-budget-usd': String(config.maxBudgetUsd) },
      body: JSON.stringify({ messages: [{ role: 'user', content: item.question }] })
    });
    await response.text();
    const row = await runCase(item, config);
    const [before, after] = await fixture.requests();
    const wire = request => request.wire.replace(/\r\nconnection: (keep-alive|close)\r\n/i, '\r\nconnection: <connection>\r\n');
    expect(before.rawHeaders).toContain('keep-alive');
    expect(after.rawHeaders).toContain('close');
    expect(wire(after)).toBe(wire(before));
    expect(row.frames.map(frame => frame.type)).toEqual(['ready', 'token', 'done', 'eval-cost']);
    expect(row.costUsd).toBe(0);
  });

  it.each([['reset', 'fetch', null, 0], ['stream-reset', 'stream', 200, 1]])('records %s once with its cause and unknown cost', async (mode, phase, status, frameCount) => {
    const fixture = await server(); await fixture.mode(mode);
    const row = await runCase(item, options(fixture.endpoint));
    expect(row.clientError).toBeTruthy();
    const code = phase === 'stream' ? 'UND_ERR_RES_CONTENT_LENGTH_MISMATCH' : expect.stringMatching(/^(UND_ERR_SOCKET|ECONNRESET)$/);
    expect(row.clientErrorDetails).toMatchObject({ phase, name: 'TypeError', cause: { code } });
    expect(row.responseStatus).toBe(status); expect(row.frames).toHaveLength(frameCount);
    expect(row.costUsd).toBeNull(); expect(row.answerCost).toBeNull();
    expect(await fixture.requests()).toHaveLength(1);
  });

  it('uses close for the real free-preflight CLI without reaching a model stage', async () => {
    const fixture = await server();
    const child = spawn(process.execPath, ['scripts/run-playground-semantic-eval.mjs', '--preflight', '--url', new URL('/', fixture.endpoint).href], {
      env: { ...process.env, MCP_SERVER_SECRET: 'synthetic-test-secret' }, stdio: 'pipe', timeout: 5000
    });
    children.add(child);
    let stdout = ''; child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.resume();
    const [code] = await once(child, 'exit'); children.delete(child);
    expect(code).toBe(0); expect(stdout).toContain('preflight complete');
    const requests = await fixture.requests();
    expect(requests).toHaveLength(1); expect(requests[0].body).toBe('{}');
    expect(requests[0].rawHeaders).toContain('close');
  }, 10000);
});
