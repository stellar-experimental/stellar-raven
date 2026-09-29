import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import manifest from '../../../catalog/manifest.json';
import { callStellarDocs } from '../../../src/adapters/stellar-docs';
import { parseEnvFile } from '../../../scripts/lib/shared.mjs';

const env = { ...parseEnvFile(`${process.cwd()}/.env`), ...parseEnvFile(`${process.cwd()}/.dev.vars`) };
const entry = manifest.entries.find(candidate => candidate.id === 'stellarDocs.get_doc_page_sections');
if (!entry) throw new Error('missing stellarDocs.get_doc_page_sections');
const cases = [
  {
    path: '/docs/learn/fundamentals/lumens',
    present: ['which counts as two and so requires two base reserves', '1 claimant/base reserve (0.5 XLM) = 3 XLM'],
    absent: ['(for both traditional assets and pool shares)', '= 3.5 XLM'],
  },
  {
    path: '/docs/learn/fundamentals/stellar-data-structures/accounts',
    present: ['Trustlines for traditional assets (one subentry each)', 'Trustlines for pool shares (two subentries each)'],
    absent: ['(includes traditional assets and pool shares)'],
  },
];
function textFromHtml(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ').trim();
}
function check(text: string, item: typeof cases[number]) {
  return { present: Object.fromEntries(item.present.map(marker => [marker, text.includes(marker)])),
    absent: Object.fromEntries(item.absent.map(marker => [marker, !text.includes(marker)])) };
}
const results = [];
for (const item of cases) {
  const url = `https://developers.stellar.org${item.path}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  const html = await response.text();
  const sourceText = textFromHtml(html);
  const indexed = await callStellarDocs(entry as never, { path: item.path, includeContent: true }, env as never);
  let index;
  if (indexed.ok) {
    const data = indexed.data as { sections: Array<{ content?: string }>; nbSections: number; complete: boolean; truncated: boolean };
    index = { ok: true, nbSections: data.nbSections, complete: data.complete, truncated: data.truncated,
      checks: check(data.sections.map(section => section.content ?? '').join('\n'), item) };
  } else index = { ok: false, error: indexed.error };
  results.push({ path: item.path, url, source: { status: response.status,
    sha256: createHash('sha256').update(html).digest('hex'), checks: check(sourceText, item),
    liquidityPoolsLink: html.includes('liquidity-on-stellar-sdex-liquidity-pools#trustlines') }, index });
}
const payload = { checkedAt: new Date().toISOString(), finding: 'sd-046', results };
writeFileSync('.agents/rounds/2026-09-29-truth-maintenance/sd-046-live.json', JSON.stringify(payload, null, 2) + '\n');
console.log(JSON.stringify(payload, null, 2));
