import { describe, expect, it } from 'vitest';
import { exactClusteredP, holmAdjust, evaluateFinals } from '../research/audits/2026-11-06-playground-final-resolution/decision.mjs';
const models = ['openai/base', 'openai/fallback', 'openai/a', 'openai/b', 'openai/c', 'openai/d', 'anthropic/a', 'anthropic/b'];
const caseIds = Array.from({ length: 101 }, (_, i) => `case-${i}`);
function fixture() {
  return { models, caseIds, safetyCaseIds: [caseIds.at(-1)], baseline: models[0], currentFallback: models[1], rows: models.flatMap(model => caseIds.flatMap(caseId => [1, 2].map(repeat => ({ model, caseId, repeat, score: 'correct', adjudicated: 'correct', judgeA: 'correct', judgeB: 'correct', gradeBasis: 'blinded-adjudication-v1', answerFailure: null, reviewed: true, methodValid: true, safety: caseId === caseIds.at(-1) ? 'pass' : 'not-applicable' })))) };
}
function grade(row, score) { Object.assign(row, {score, adjudicated: score, judgeA: score, judgeB: score}); }
describe('fixed-denominator model decision', () => {
  it('keeps repeats clustered rather than doubling the effective sample', () => {
    expect(exactClusteredP([2, 2, 2])).toBe(0.125);
    expect(exactClusteredP([1, 1, 1, 1, 1, 1])).toBe(0.015625);
    expect(exactClusteredP([0, 0])).toBe(1);
    expect(exactClusteredP([-2, -2])).toBe(1);
  });
  it('applies Holm across both endpoints and preserves original order', () => {
    expect(holmAdjust([0.03, 0.001, 0.04])).toEqual([0.06, 0.003, 0.06]);
  });
  it('retains baseline for equivalent results', () => {
    const r = evaluateFinals(fixture());
    expect(r.denominator).toBe(202); expect(r.primaryTies).toEqual([models[0]]);
  });
  it('rejects missing, duplicate, unknown-cost and unreviewed cells', () => {
    const input = fixture(); input.rows.pop(); expect(() => evaluateFinals(input)).toThrow('Incomplete');
    const duplicate = fixture(); duplicate.rows.push(duplicate.rows[0]); expect(() => evaluateFinals(duplicate)).toThrow('Duplicate');
    const invalid = fixture(); invalid.rows[0].methodValid = false; expect(() => evaluateFinals(invalid)).toThrow('Unresolved');
    const review = fixture(); review.rows[0].reviewed = false; expect(() => evaluateFinals(review)).toThrow('Unresolved');
  });
  it('requires an explicit assessment of the safety case', () => {
    const input = fixture(); input.rows.find(r => r.caseId === caseIds.at(-1)).safety = 'not-applicable';
    expect(() => evaluateFinals(input)).toThrow('not assessed');
  });
  it('counts refusals as bad outcomes and prevents a non-answering candidate from winning', () => {
    const input = fixture();
    for (const row of input.rows.filter(r => r.model === models[2])) { grade(row, null); row.answerFailure = 'provider-refusal'; }
    const r = evaluateFinals(input); expect(r.summaries[models[2]].bad).toBe(202); expect(r.primaryTies).toEqual([models[0]]);
  });
  it('recognizes replicated improvement but excludes an unsafe model', () => {
    const input = fixture();
    for (const row of input.rows.filter(r => r.model !== models[2] && Number(r.caseId.slice(5)) < 20)) grade(row, 'wrong');
    expect(evaluateFinals(input).primaryTies).toEqual([models[2]]);
    input.rows.find(r => r.model === models[2]).safety = 'fail';
    expect(evaluateFinals(input).primaryTies).toEqual([models[0]]);
  });
  it('does not promote an advantage confined to one repeat', () => {
    const input = fixture();
    for (const row of input.rows.filter(r => r.model !== models[2] && r.repeat === 1 && Number(r.caseId.slice(5)) < 30)) grade(row, 'wrong');
    expect(evaluateFinals(input).primaryTies).toEqual([models[0]]);
  });
  it('requires provenance and a reason for adjudication changes', () => {
    const input = fixture(); input.rows[0].judgeB = 'partial';
    expect(() => evaluateFinals(input)).toThrow('evidence reason');
    input.rows[0].reason = 'The full transcript supports every required fact.';
    expect(evaluateFinals(input).summaries[models[0]].judgeDisagreement).toBe(1);
    input.rows[0].adjudicated = 'wrong'; expect(() => evaluateFinals(input)).toThrow('provenance');
  });
  it('requires a different-vendor fallback with no quality or reliability regression', () => {
    const input = fixture();
    grade(input.rows.find(r => r.model === 'anthropic/a'), 'wrong');
    const r = evaluateFinals(input); expect(r.fallbackByPrimary[models[0]]).toEqual(['anthropic/b']);
  });
  it('keeps a nominal small-p win below the multiplicity gate', () => {
    const input = fixture();
    for (const row of input.rows.filter(r => r.model === models[0] && Number(r.caseId.slice(5)) < 7)) grade(row, 'wrong');
    const c = evaluateFinals(input).comparisons[0];
    expect(c.badP).toBe(1 / 128); expect(c.badAdjustedP).toBe(14 / 128); expect(c.qualifies).toBe(false);
  });
  it('allows replicated correct gains only without bad regression', () => {
    const input = fixture();
    for (const row of input.rows.filter(r => r.model !== models[2] && Number(r.caseId.slice(5)) < 12)) grade(row, 'partial');
    expect(evaluateFinals(input).primaryTies).toEqual([models[2]]);
    grade(input.rows.find(r => r.model === models[2] && r.repeat === 2 && r.caseId === 'case-40'), 'wrong');
    expect(evaluateFinals(input).primaryTies).toEqual([models[0]]);
  });
  it('vetoes reliability regression despite significant quality gains', () => {
    const input = fixture();
    for (const row of input.rows.filter(r => r.model !== models[2] && Number(r.caseId.slice(5)) < 20)) grade(row, 'wrong');
    const failed = input.rows.find(r => r.model === models[2]); grade(failed, null); failed.answerFailure = 'abort-timeout';
    const c = evaluateFinals(input).comparisons.find(c => c.model === models[2]);
    expect(c.badAdjustedP).toBeLessThan(0.05); expect(c.reliable).toBe(false); expect(c.qualifies).toBe(false);
  });
  it('uses exact mixed-sign probabilities and returns no ineligible fallback', () => {
    expect(exactClusteredP([1, -1])).toBe(0.75);
    const input = fixture();
    for (const model of ['anthropic/a', 'anthropic/b']) grade(input.rows.find(r => r.model === model), 'wrong');
    expect(evaluateFinals(input).fallbackByPrimary[models[0]]).toEqual([]);
  });
  it('rejects absent judge attempts and excludes failures from agreement', () => {
    const input = fixture(); input.rows[0].judgeA = null; input.rows[0].reason = 'Manual review';
    expect(() => evaluateFinals(input)).toThrow('Judge attempts');
    grade(input.rows[0], null); input.rows[0].answerFailure = 'provider-refusal';
    expect(evaluateFinals(input).summaries[models[0]].judgeComparable).toBe(201);
    input.rows[0].judgeB = 'wrong'; expect(() => evaluateFinals(input)).toThrow('Judge attempts');
  });
  it('rejects a safety pass marker on ordinary cases', () => {
    const input = fixture(); input.rows[0].safety = 'pass';
    expect(() => evaluateFinals(input)).toThrow('Non-safety');
  });

});
