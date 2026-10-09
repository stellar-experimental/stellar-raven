import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { buildTranscriptEvidencePack, findTranscriptEvidencePackOmissions } from '../../../../eval/qa/evidence-pack.mjs';
import { diagnoseRow } from '../../../../eval/qa/diagnose-stable-evidence.mjs';
const path = 'eval/qa/results/2026-10-07-tool-surface-qa/2026-10-08T02-40-37-variantA.json';
const bytes = readFileSync(path);
const data = JSON.parse(bytes);
// Export read-only internals in memory to inspect selection. Do not change the source module.
const source = readFileSync('eval/qa/evidence-pack.mjs', 'utf8');
const internals = await import(`data:text/javascript;base64,${Buffer.from(source + '\nexport { extractCandidateClaimTerms, collectClaimSnippets, selectClaimSnippetsForCoverage, executeEntries, collectSourceItems, rankedItems, prioritizeItemsForCandidateExactTerms };').toString('base64')}`);
const output = [];
for (const id of ['q-hist-quantum-preparedness-plan', 'q-soroban-oz-upgradeable-macro']) {
  const row = data.rows.find((row) => row.id === id);
  const input = { ...row.caseInput, tags: row.tags, question: row.question, transcript: row.transcript, candidateAnswer: row.answer };
  const pack = buildTranscriptEvidencePack(input);
  const widePack = buildTranscriptEvidencePack({ ...input, maxChars: 100000 });
  const entries = internals.executeEntries(row.transcript);
  const terms = internals.extractCandidateClaimTerms(input);
  const ranked = internals.prioritizeItemsForCandidateExactTerms(internals.rankedItems(internals.collectSourceItems(entries), internals.extractEvidenceTerms(input)), row.answer);
  const snippets = internals.collectClaimSnippets(entries, terms, ranked.slice(0, 2));
  const selected = internals.selectClaimSnippetsForCoverage(snippets, terms, 8);
  const targets = id.includes('quantum') ? ['already becoming protocol'] : ['#[derive(Upgradeable)]', '#[derive(UpgradeableMigratable)]'];
  output.push({ id, storedPack: row.evidencePack, reproducedPackSha256: createHash('sha256').update(pack).digest('hex'), packChars: pack.length, widePackChars: widePack.length,
    targets: targets.map(term => ({ term, candidateContains: row.answer.includes(term), extractedTerm: terms.includes(term), rawSnippets: snippets.filter(s=>s.snippet.includes(term)).length, selectedSnippets: selected.filter(s=>s.snippet.includes(term)).length, selectedAnchors: selected.filter(s=>s.snippet.includes(term)).map(s=>({term:s.term,entryIndex:s.entryIndex,targetOffset:s.snippet.indexOf(term),snippetChars:s.snippet.length})), packContains: pack.includes(term), widePackContains: widePack.includes(term) })),
    omission: findTranscriptEvidencePackOmissions({ transcript: row.transcript, transcriptEvidence: pack, claims: row.verdict.wrongClaims }),
    diagnostic: diagnoseRow(row) });
}
const report = { source: path, sourceSha256: createHash('sha256').update(bytes).digest('hex'), output };
console.log(JSON.stringify(report, null, 2));
