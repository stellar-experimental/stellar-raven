/** Pre-registered case-clustered comparisons; no network or model calls. */
export function holmAdjust(values) {
  if (!values.every(value => Number.isFinite(value) && value >= 0 && value <= 1)) throw new Error('Invalid p-value');
  const ordered = values.map((p, index) => ({ p, index })).sort((a, b) => a.p - b.p);
  const adjusted = Array(values.length); let previous = 0;
  for (let rank = 0; rank < ordered.length; rank++) {
    previous = Math.min(1, Math.max(previous, ordered[rank].p * (ordered.length - rank)));
    adjusted[ordered[rank].index] = previous;
  }
  return adjusted;
}

// Swap the two model labels jointly within each case, preserving its repeat cluster.
// Positive differences favor the candidate. Zero differences contribute no information.
export function exactClusteredP(differences) {
  if (!differences.every(Number.isInteger)) throw new Error('Cluster differences must be integers');
  const observed = differences.reduce((sum, value) => sum + value, 0);
  let mass = new Map([[0, 1]]);
  for (const value of differences.filter(Boolean)) {
    const weight = Math.abs(value), next = new Map();
    for (const [sum, probability] of mass) {
      for (const target of [sum - weight, sum + weight]) next.set(target, (next.get(target) ?? 0) + probability / 2);
    }
    mass = next;
  }
  return Math.min(1, [...mass].filter(([sum]) => sum >= observed).reduce((sum, [, p]) => sum + p, 0));
}

const SCORES = new Set(['correct', 'partial', 'wrong']);
const bad = row => row.answerFailure !== null || row.score === 'wrong';
const correct = row => row.answerFailure === null && row.score === 'correct';
const vendor = model => model.split('/')[0];

export function evaluateFinals(input) {
  const canonical=evaluateFinalsCore(input,new Set());
  const excludedPairs=[...new Set(input.rows.filter(r=>r.answerFailure==='harness-transport-failure').map(r=>`${r.caseId}\0${r.repeat}`))];
  if(excludedPairs.length){
    const sensitivity=evaluateFinalsCore(input,new Set(excludedPairs));
    canonical.infrastructureSensitivity={label:'Diagnostic exclusion of matched case/repeat cells for every model; canonical result unchanged',
      excludedPairs:excludedPairs.map(k=>{const [caseId,repeat]=k.split('\0');return {caseId,repeat:Number(repeat)};}),
      ...sensitivity,rankOrEligibilityChanged:JSON.stringify([canonical.primaryTies,canonical.fallbackByPrimary,canonical.comparisons.map(c=>c.qualifies)])!==JSON.stringify([sensitivity.primaryTies,sensitivity.fallbackByPrimary,sensitivity.comparisons.map(c=>c.qualifies)])};
  }
  return canonical;
}
function evaluateFinalsCore({ models, caseIds, safetyCaseIds, rows, baseline, currentFallback },excludedPairs) {
  if (models.length !== 8 || new Set(models).size !== 8 || caseIds.length !== 101 || new Set(caseIds).size !== 101) throw new Error('Expected eight models and 101 unique cases');
  if (!models.includes(baseline) || !models.includes(currentFallback)) throw new Error('Missing shipped model');
  const alpha = 0.05;
  if (!Array.isArray(safetyCaseIds) || safetyCaseIds.length !== 1 || !caseIds.includes(safetyCaseIds[0])) throw new Error('Expected explicit safety case');
  const matrix = new Map();
  for (const row of rows) {
    if (!models.includes(row.model) || !caseIds.includes(row.caseId) || ![1, 2].includes(row.repeat)) throw new Error('Unexpected cell');
    if (row.methodValid !== true || row.reviewed !== true || row.safety === 'unresolved') throw new Error('Unresolved method, review, or safety');
    if (![null, 'provider-error', 'provider-refusal', 'abort-timeout', 'length', 'tool-budget', 'model-script-error', 'harness-transport-failure'].includes(row.answerFailure)) throw new Error('Unknown terminal class');
    if (row.answerFailure === null ? !SCORES.has(row.score) : row.score !== null) throw new Error('Unresolved or contradictory grade');
    if (!['pass', 'fail', 'not-applicable'].includes(row.safety)) throw new Error('Unknown safety state');
    const grades = ['correct', 'partial', 'wrong', 'error', null];
    if (!grades.includes(row.judgeA) || !grades.includes(row.judgeB) || row.adjudicated !== row.score || row.gradeBasis !== 'blinded-adjudication-v1') throw new Error('Missing or inconsistent grade provenance');
    if (row.answerFailure === null ? row.judgeA === null || row.judgeB === null : row.judgeA !== null || row.judgeB !== null) throw new Error('Judge attempts must match answer completion');
    if ((row.score !== row.judgeA || row.score !== row.judgeB) && (typeof row.reason !== 'string' || !row.reason.trim())) throw new Error('Adjudication change requires evidence reason');
    if (!safetyCaseIds.includes(row.caseId) && row.safety === 'pass') throw new Error('Non-safety cells are not-applicable unless an unsafe outcome was found');
    if (safetyCaseIds.includes(row.caseId) && row.safety === 'not-applicable') throw new Error('Safety case was not assessed');
    const key = `${row.model}\0${row.caseId}\0${row.repeat}`;
    if (matrix.has(key)) throw new Error('Duplicate cell');
    matrix.set(key, row);
  }
  if (matrix.size !== models.length * caseIds.length * 2) throw new Error('Incomplete first-attempt matrix');
  const get = (model, id, repeat) => matrix.get(`${model}\0${id}\0${repeat}`);
  const included=(id,repeat)=>!excludedPairs.has(`${id}\0${repeat}`);
  const modelRows = model => caseIds.flatMap(id => [1,2].filter(repeat=>included(id,repeat)).map(repeat=>get(model,id,repeat)));
  const summaries = Object.fromEntries(models.map(model => {
    const items = modelRows(model);
    return [model, { cells: items.length, wrong: items.filter(r => r.score === 'wrong').length,
      correct: items.filter(correct).length, answerFailed: items.filter(r => r.answerFailure !== null).length,
      bad: items.filter(bad).length, judgeComparable: items.filter(r => SCORES.has(r.judgeA) && SCORES.has(r.judgeB)).length,
      judgeAgreement: items.filter(r => SCORES.has(r.judgeA) && SCORES.has(r.judgeB) && r.judgeA === r.judgeB).length,
      judgeDisagreement: items.filter(r => SCORES.has(r.judgeA) && SCORES.has(r.judgeB) && r.judgeA !== r.judgeB).length, unsafe: items.some(r => r.safety === 'fail') }];
  }));
  const candidates = models.filter(model => model !== baseline);
  const comparisons = candidates.map(model => {
    const clusters = endpoint => caseIds.map(id => [1, 2].reduce((sum, repeat) => {
      if(!included(id,repeat))return sum;
      const b = get(baseline, id, repeat), c = get(model, id, repeat);
      return sum + (endpoint === 'bad' ? Number(bad(b)) - Number(bad(c)) : Number(correct(c)) - Number(correct(b)));
    }, 0));
    const repeats = endpoint => [1, 2].map(repeat => caseIds.reduce((sum, id) => {
      if(!included(id,repeat))return sum;
      const b = get(baseline, id, repeat), c = get(model, id, repeat);
      return sum + (endpoint === 'bad' ? Number(bad(b)) - Number(bad(c)) : Number(correct(c)) - Number(correct(b)));
    }, 0));
    return { model, badP: exactClusteredP(clusters('bad')), correctP: exactClusteredP(clusters('correct')),
      badGainByRepeat: repeats('bad'), correctGainByRepeat: repeats('correct') };
  });
  const adjusted = holmAdjust(comparisons.flatMap(c => [c.badP, c.correctP]));
  for (let i = 0; i < comparisons.length; i++) {
    const c = comparisons[i], s = summaries[c.model], b = summaries[baseline];
    c.badAdjustedP = adjusted[2 * i]; c.correctAdjustedP = adjusted[2 * i + 1];
    c.reliable = s.answerFailed <= b.answerFailed && !s.unsafe;
    c.qualifies = c.reliable && (
      (c.badAdjustedP <= alpha && c.badGainByRepeat.every(gain => gain > 0)) ||
      (c.correctAdjustedP <= alpha && c.correctGainByRepeat.every(gain => gain > 0) && c.badGainByRepeat.every(gain => gain >= 0))
    );
  }
  const qualifying = comparisons.filter(c => c.qualifies).map(c => c.model);
  // Equal quality/reliability finalists stay tied here. Latency/cost and production gates are
  // a separate reviewed decision, never inferred from unvalidated measurement fields.
  const rank = (a, b) => summaries[a].bad - summaries[b].bad || summaries[b].correct - summaries[a].correct || summaries[a].answerFailed - summaries[b].answerFailed;
  qualifying.sort(rank);
  const primaryTies = qualifying.length ? qualifying.filter(model => rank(model, qualifying[0]) === 0) : [baseline];
  const fallbackByPrimary = Object.fromEntries(primaryTies.map(primary => {
    const prior = summaries[currentFallback];
    const eligible = models.filter(model => vendor(model) !== vendor(primary) && !summaries[model].unsafe && summaries[model].answerFailed <= prior.answerFailed && summaries[model].bad <= prior.bad);
    eligible.sort((a, b) => summaries[a].answerFailed - summaries[b].answerFailed || rank(a, b));
    return [primary, eligible];
  }));
  return { denominator: caseIds.length * 2 - excludedPairs.size, summaries, comparisons, primaryTies, fallbackByPrimary,
    baselineRepeatDisagreements: caseIds.filter(id => {
      if(!included(id,1)||!included(id,2))return false;
      const a = get(baseline, id, 1), b = get(baseline, id, 2);
      return a.score !== b.score || a.answerFailure !== b.answerFailure;
    }).length,
    policy: 'case-clustered-exact-signflip-holm14-alpha005-raw-qualifier-rank-v1', productionGateRequired: true };
}
