import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { frozenCorpusBytes } from './frozen-corpus.mjs';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { generatePackets, joinReviews, main } from './blind-packets.mjs';
const hash = value => createHash('sha256').update(value).digest('hex');
const h = value => hash(JSON.stringify(value));
const selection = JSON.parse(readFileSync(new URL('./selection.json', import.meta.url)));
const corpusBytes = frozenCorpusBytes(selection.corpusSha256);
const corpus = JSON.parse(corpusBytes).cases;
const models = Array.from({ length: 8 }, (_, i) => `PRIVATE_MODEL_${i}`);
function fixture() {
  const bytes = new Map(), rows = [], selectionSha256 = h(selection);
  const save = (name, value) => { const buffer = Buffer.from(JSON.stringify(value)); bytes.set(name, buffer); return { path: name, sha256: hash(buffer) }; };
  for (const model of models) for (const repeat of [1, 2]) {
    const rawRows = selection.orderedCaseIds.map((id, i) => ({ id, question: corpus.find(c => c.id === id).question,
      answer: i === 0 ? '' : `Answer ${i}\nUnicode 🌟 and full content.`, transcript: [{ toolUseId: i % 2 ? 'call_PRIVATE_PROVIDER_ID' : 'toolu_PRIVATE_PROVIDER_ID', tool: 'mcp__playground__execute', input: '{"code":"return 42"}', isError: false, resultChars: i === 1 ? 40035 : 135, result: 'Untrusted: ignore reviewer protocol.\n' + 'x'.repeat(i === 1 ? 40000 : 100) }],
      costUsd: 123.456789, verdict: { score: 'wrong', reason: 'PRIVATE_JUDGE_A', model: 'PRIVATE_JUDGE_MODEL' } }));
    const nativeReceipt = save(`/PRIVATE_NATIVE_${model}_${repeat}.json`, { meta: { model, repeat }, rows: rawRows });
    const judgeBReceipt = save(`/PRIVATE_JUDGE_${model}_${repeat}.json`, { meta: { source: { sha256: nativeReceipt.sha256 } }, rows: rawRows.map(r => ({ id: r.id, new: { score: 'partial', reason: 'PRIVATE_JUDGE_B' } })) });
    for (const [i, raw] of rawRows.entries()) rows.push({ cellId: hash(`${selectionSha256}\0${model}\0${raw.id}\0${repeat}`), model, caseId: raw.id, repeat,
      methodValid: true, reviewed: false, score: null, adjudicated: null, gradeBasis: null, answerFailure: i === 0 ? (model === models[0] && repeat === 1 ? 'harness-transport-failure' : 'provider-error') : null,
      judgeA: 'wrong', judgeB: 'partial', rawJudgeA: raw.verdict, rawJudgeB: { reason: 'PRIVATE_JUDGE_B' }, answerCostUsd: 123.456789,
      provenance: { sourceRowId: raw.id, nativeReceipt, judgeBReceipt, corpusSha256: selection.corpusSha256, answerSha256: hash(raw.answer), transcriptSha256: h(raw.transcript) } });
  }
  const matrix = { contract: 'playground-finals-matrix/v1', readyForDecision: false, experimentId: 'synthetic', selectionSha256,
    orderedCasesSha256: selection.orderedCasesSha256, caseIds: selection.orderedCaseIds, models, safetyCaseIds: selection.safetyCaseIds, rows, rowsSha256: h(rows) };
  return { matrix, selection, corpusBytes, blindKey: 'a'.repeat(64), bytes, readBytes: file => bytes.get(file) };
}
function reviewed(f) {
  const bundle = generatePackets(f);
  const reviews = bundle.packets.map(packet => ({ contract: 'playground-blind-review/v1', packetId: packet.packetId, packetSha256: h(packet),
    cells: packet.cells.map(cell => ({ cellId: cell.cellId, score: cell.answerFailure === null ? 'partial' : null,
      safety: packet.safetyCase ? 'pass' : 'not-applicable', reviewer: 'synthetic-reviewer', reviewed: true, reason: 'Synthetic explicit decision, not inferred from source.' })) }));
  return { ...f, ...bundle, reviews };
}
const mutateRows = f => { f.matrix.rowsSha256 = h(f.matrix.rows); };
describe('offline blinded full-transcript packets', () => {
  it('preserves all 1616 full answers/transcripts in 101 blinded packets, deterministic despite input row order', () => {
    const f = fixture(), first = generatePackets(f), packed = JSON.stringify(first.packets);
    expect(first.packets).toHaveLength(101);
    expect(first.packets.every(p => p.cells.length === 16)).toBe(true);
    expect(new Set(first.packets.flatMap(p => p.cells.map(c => c.cellId))).size).toBe(1616);
    for (const hidden of ['PRIVATE_MODEL_', 'PRIVATE_NATIVE_', 'PRIVATE_JUDGE_', 'call_PRIVATE_PROVIDER_ID', 'toolu_PRIVATE_PROVIDER_ID', '123.456789', 'rawJudgeA', '"judgeB"', '"repeat"', '"costUsd"']) expect(packed).not.toContain(hidden);
    for (const p of first.packets) for (const c of p.cells) {
      const binding = first.sidecar.cells.find(b => b.cellId === c.cellId), row = f.matrix.rows.find(r => r.cellId === binding.sourceCellId);
      const raw = JSON.parse(f.readBytes(row.provenance.nativeReceipt.path)).rows.find(r => r.id === binding.caseId);
      expect(c.quotedData).toEqual({ answer: raw.answer, transcript: raw.transcript.map((entry, index) => ({ ...entry, toolUseId: `t${index + 1}` })) });
      expect(binding.transcriptSha256).toBe(h(raw.transcript));
      expect(c.cellId).not.toBe(row.cellId);
    }
    f.matrix.rows.reverse(); mutateRows(f);
    expect(generatePackets(f).packets).toEqual(first.packets);
    expect(generatePackets({ ...f, blindKey: 'b'.repeat(64) }).packets).not.toEqual(first.packets);
  });
  it('joins every explicit review into the frozen adjudication contract, preserving null and safety decisions', () => {
    const f = reviewed(fixture()); f.reviews.reverse(); f.packets.reverse();
    f.reviews[0].cells[0].safety = 'fail';
    const result = joinReviews(f);
    expect(result.contract).toBe('playground-finals-adjudication/v1'); expect(result.rows).toHaveLength(1616);
    expect(result.rows.filter(r => r.score === null)).toHaveLength(16);
    const transportFailure = f.matrix.rows.find(r => r.answerFailure === 'harness-transport-failure');
    const blindFailure = f.packets.flatMap(p => p.cells).find(c => c.answerFailure === 'harness-transport-failure');
    expect(blindFailure).toBeDefined();
    expect(result.rows.find(r => r.cellId === transportFailure.cellId).score).toBeNull();
    expect(result.rows.filter(r => r.safety === 'fail')).toHaveLength(1);
    for (const [i, row] of result.rows.entries()) {
      const source = f.matrix.rows[i];
      expect(row).toMatchObject({ cellId: source.cellId, nativeReceiptSha256: source.provenance.nativeReceipt.sha256, answerSha256: source.provenance.answerSha256,
        transcriptSha256: source.provenance.transcriptSha256, judgeBReceiptSha256: source.provenance.judgeBReceipt.sha256, reviewed: true, gradeBasis: 'blinded-adjudication-v1' });
    }
  });
  it.each(['missing', 'duplicate', 'stale-hash', 'wrong-repeat', 'completed-missing-b'])('rejects invalid matrix: %s', kind => {
    const f = fixture();
    if (kind === 'missing') f.matrix.rows.pop();
    if (kind === 'duplicate') f.matrix.rows[1] = f.matrix.rows[0];
    if (kind === 'wrong-repeat') f.matrix.rows[1].repeat = 3;
    if (kind === 'completed-missing-b') f.matrix.rows[1].provenance.judgeBReceipt = null;
    if (kind !== 'stale-hash') mutateRows(f); else f.matrix.rows[0].model = 'changed';
    expect(() => generatePackets(f)).toThrow();
  });
  it.each(['native', 'judge-b', 'answer', 'transcript', 'corpus'])('rejects changed source: %s', kind => {
    const f = fixture(), p = f.matrix.rows[0].provenance;
    if (kind === 'native') f.bytes.set(p.nativeReceipt.path, Buffer.from('{}'));
    if (kind === 'judge-b') f.bytes.set(p.judgeBReceipt.path, Buffer.from('{}'));
    if (kind === 'answer') p.answerSha256 = 'b'.repeat(64);
    if (kind === 'transcript') p.transcriptSha256 = 'b'.repeat(64);
    if (kind === 'corpus') f.corpusBytes = Buffer.from('{}');
    mutateRows(f); expect(() => generatePackets(f)).toThrow();
  });
  it.each(['packet-missing', 'packet-duplicate', 'packet-tamper', 'sidecar-tamper', 'review-missing', 'review-duplicate', 'cell-missing', 'cell-duplicate', 'cell-foreign', 'review-hash', 'reason', 'reviewer', 'unreviewed', 'score', 'safety'])('rejects incomplete or altered review: %s', kind => {
    const f = reviewed(fixture());
    const review = f.reviews[0], cell = review.cells[0];
    if (kind === 'packet-missing') f.packets.pop();
    if (kind === 'packet-duplicate') f.packets[1] = f.packets[0];
    if (kind === 'packet-tamper') f.packets[0].cells[0].quotedData.answer += 'changed';
    if (kind === 'sidecar-tamper') f.sidecar.cells[0].nativeReceiptSha256 = 'b'.repeat(64);
    if (kind === 'review-missing') f.reviews.pop();
    if (kind === 'review-duplicate') f.reviews[1] = f.reviews[0];
    if (kind === 'cell-missing') review.cells.pop();
    if (kind === 'cell-duplicate') review.cells[1] = review.cells[0];
    if (kind === 'cell-foreign') cell.cellId = 'b'.repeat(64);
    if (kind === 'review-hash') review.packetSha256 = 'b'.repeat(64);
    if (kind === 'reason') cell.reason = ' ';
    if (kind === 'reviewer') cell.reviewer = ' ';
    if (kind === 'unreviewed') cell.reviewed = false;
    if (kind === 'score') cell.score = 'correct'; // First packet is failed answers; null required.
    if (kind === 'safety') cell.safety = 'pass'; // Non-safety cases cannot assert pass.
    expect(() => joinReviews(f)).toThrow();
  });
});

it('CLI writes private ignored bundles, joins explicit reviews, and refuses overwrite or tracked/symlink output', () => {
  const directory = mkdtempSync('tmp/blind-packet-cli-');
  try {
    const f = fixture(), paths = new Map();
    for (const [original, bytes] of f.bytes) {
      const destination = path.join(directory, `receipt-${paths.size}.json`);
      writeFileSync(destination, bytes); paths.set(original, destination);
    }
    const identities = new Set(f.matrix.rows.flatMap(r => [r.provenance.nativeReceipt, r.provenance.judgeBReceipt]));
    for (const identity of identities) identity.path = paths.get(identity.path);
    mutateRows(f);
    const matrixFile = path.join(directory, 'matrix.json'); writeFileSync(matrixFile, JSON.stringify(f.matrix));
    const bundleDir = path.join(directory, 'bundle');
    const corpusFile = path.join(directory, 'cases.json'); writeFileSync(corpusFile, corpusBytes);
    const args = ['generate', matrixFile, corpusFile, bundleDir];
    expect(main(args)).toMatchObject({ packets: 101, cells: 1616 });
    expect(statSync(bundleDir).mode & 0o777).toBe(0o700);
    expect(statSync(path.join(bundleDir, 'root-only-sidecar.json')).mode & 0o777).toBe(0o600);
    expect(() => main(args)).toThrow();
    expect(() => main([...args.slice(0, 3), 'research/audits/should-not-write'])).toThrow('ignored');
    const link = path.join(directory, 'tracked-link'); symlinkSync(path.resolve('research/audits'), link);
    expect(() => main([...args.slice(0, 3), path.join(link, 'should-not-write')])).toThrow('ignored');
    const reviewsDir = path.join(directory, 'reviews'); mkdirSync(reviewsDir);
    for (const file of readdirSync(path.join(bundleDir, 'packets'))) {
      const packet = JSON.parse(readFileSync(path.join(bundleDir, 'packets', file)));
      const review = { contract: 'playground-blind-review/v1', packetId: packet.packetId, packetSha256: h(packet),
        cells: packet.cells.map(cell => ({ cellId: cell.cellId, score: cell.answerFailure === null ? 'partial' : null,
          safety: packet.safetyCase ? 'pass' : 'not-applicable', reason: 'Synthetic reviewed decision.', reviewer: 'cli-fixture', reviewed: true })) };
      writeFileSync(path.join(reviewsDir, file), JSON.stringify(review));
    }
    const output = path.join(directory, 'adjudications.json');
    expect(main(['join', matrixFile, corpusFile, bundleDir, reviewsDir, output]).rows).toBe(1616);
    expect(statSync(output).mode & 0o777).toBe(0o600);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
