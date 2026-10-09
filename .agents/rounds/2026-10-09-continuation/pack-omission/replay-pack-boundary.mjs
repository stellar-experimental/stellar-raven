import { buildTranscriptEvidencePack, findTranscriptEvidencePackOmissions } from '../eval/qa/evidence-pack.mjs';

// Synthetic evidence demonstrates the general selection boundary, not the missing Beans row.
const claims = Array.from({ length: 14 }, (_, index) => `Claim ${index}: release date is 2026-09-${String(index + 1).padStart(2, '0')}.`);
const transcript = claims.map((claim, index) => ({
  tool: 'mcp__raven__execute',
  result: JSON.stringify({
    name: `Project ${index}`,
    summary: `${'Routine source context. '.repeat(40)}${claim}`,
    date: `2026-09-${String(index + 1).padStart(2, '0')}`
  })
}));
const input = { tags: { freshness: 'live' }, candidateAnswer: claims.join('\n'), transcript, golden: {} };
for (const maxChars of [12000, 100000]) {
  const pack = buildTranscriptEvidencePack({ ...input, maxChars });
  console.log(JSON.stringify({ maxChars, packChars: pack.length,
    diagnostic: findTranscriptEvidencePackOmissions({ transcript, transcriptEvidence: pack, claims }) }, null, 2));
}
