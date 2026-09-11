const format = value => new Intl.NumberFormat('en-US').format(value);
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const date = value => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const stamp = value => value.replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC').replace(/Z$/, ' UTC');

export function totals(data) {
  const mcp = data.toolWindows.filter(row => row.label.endsWith('MCP'));
  return {
    requests: data.months.reduce((sum, row) => sum + row.requests, 0),
    search: mcp.reduce((sum, row) => sum + row.search, 0),
    execute: mcp.reduce((sum, row) => sum + row.execute, 0),
    accountsLowerBound: Math.max(...mcp.map(row => row.accountsLowerBound || 0))
  };
}

export function launchCsv(data) {
  const rows = [['Month', 'Estimated Worker requests', 'Recovered MCP search responses', 'Recovered MCP execute responses', 'Active accounts lower bound', 'Tool coverage', 'Report cutoff UTC']];
  const total = totals(data);
  for (const row of data.months) {
    const recovered = row.month === '2026-09';
    rows.push([row.month, row.requests, recovered ? total.search : '', recovered ? total.execute : '', recovered ? total.accountsLowerBound : '', recovered ? 'Partial September 4-11; historical estimates plus archive' : 'Unavailable', data.generatedAt]);
  }
  return rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
}

export function launchMarkdown(data) {
  const total = totals(data);
  const lines = [
    '# Raven launch-to-date report', '',
    `Period: July 2, 2026 through ${stamp(data.generatedAt)}.`, '',
    'Complete lifetime tool-response and active-account totals are unavailable.',
    `Cloudflare returned approximately ${format(total.requests)} Worker requests across the full period.`,
    'Worker requests include website traffic, protocol traffic, checks, automation, and tool traffic.',
    'They do not measure answers or people.', '',
    '| Month | Estimated Worker requests | Tool-response history |', '|---|---:|---|',
    ...data.months.map(row => `| ${row.month} | ${format(row.requests)} | ${row.month === '2026-09' ? 'Partial: September 4 onward' : 'Unavailable'} |`), '',
    '## Recovered tool responses', '',
    `The available MCP evidence contains approximately ${format(total.search)} search and ${format(total.execute)} execute responses.`,
    `This is approximately ${format(total.search + total.execute)} MCP responses, with at least ${total.accountsLowerBound} active accounts.`,
    'These values cover the recovered September windows, not the full launch period.',
    `The separate playground evidence contains ${data.toolWindows.filter(row => row.label.toLowerCase().includes('playground')).reduce((sum,row) => sum + row.search, 0)} search and ${data.toolWindows.filter(row => row.label.toLowerCase().includes('playground')).reduce((sum,row) => sum + row.execute, 0)} execute responses.`, '',
    '| Evidence | From UTC | To UTC, exclusive | Search | Execute | Accounts |', '|---|---|---|---:|---:|---|',
    ...data.toolWindows.map(row => `| ${row.label} (${row.kind}) | ${stamp(row.from)} | ${stamp(row.toExclusive)} | ${row.search} | ${row.execute} | ${row.accountsLowerBound == null ? 'Unknown' : row.kind === 'estimate' ? 'At least ' + row.accountsLowerBound : row.accountsLowerBound} |`), '',
    '## Independent audit', '', ...auditLines(data), '',
    '## Limits', '', ...data.notes.map(note => '- ' + note), '',
    '## Sources and checks', '',
    `- [Launch date](${data.launchSource}).`,
    `- [Cloudflare request metric](${data.requestSource}).`,
    '- Historical source evidence remains in private storage.',
    '- Additional tools: September 11 14:00–14:34:59 UTC; Cloudflare app logs, ABR 1, sample interval 1.',
    '- Archive: production D1, response timestamps before the report cutoff.',
    '- Request queries use workersInvocationsAdaptive, scriptName stellar-raven-codemode, and exclusive end times.',
    '- Three monthly queries returned 30 July dates, 31 August dates, and 11 September dates.',
    '- Daily sums matched independent monthly aggregate queries. Sampling can still affect these estimates.', '',
    'The live monthly dashboard continues to refresh. This launch report is a dated snapshot.', ''
  ];
  return lines.join('\n');
}

function auditLines(data) {
  const audit = data.independentAudit;
  if (!audit) return [];
  return [
    `Fable 5.1 high checked Cloudflare MCP and Wrangler evidence through ${stamp(audit.checkedAt)}.`,
    `Historical window: ${stamp(audit.from)} to ${stamp(audit.toExclusive)}, exclusive.`,
    `The independent query returned ${format(audit.search)} search and ${format(audit.execute)} execute events from ${audit.historicalAccounts} accounts.`,
    `The archive contained ${audit.archiveSearch} search and ${audit.archiveExecute} execute responses at the audit cutoff.`,
    `The distinct union identified at least ${audit.joinedAccountsLowerBound} active tool accounts.`,
    `${audit.repeatDayAccounts} historical accounts appeared on at least two UTC dates. This does not establish monthly retention.`,
    `OAuth storage held ${audit.liveGrants} live grants across ${audit.liveGrantAccounts} accounts and ${format(audit.oauthClients)} client registrations.`,
    `AI Gateway metadata rows: July ${format(audit.gatewayMetadata['2026-07'])}; August ${format(audit.gatewayMetadata['2026-08'])}; September ${format(audit.gatewayMetadata['2026-09'])}.`,
    ...audit.limits,
    `Evidence: ${audit.source}.`
  ];
}

export function renderLaunch(data) {
  const total = totals(data);
  const days = data.months.flatMap(row => row.days);
  const max = Math.max(...days.map(row => row.requests));
  const bars = days.map((row, index) => `<rect x="${index * 12 + 1}" y="${180 - row.requests / max * 170}" width="9" height="${row.requests / max * 170}" rx="1" fill="${row.date.startsWith('2026-08') ? '#087e8b' : '#2059dc'}"><title>${row.date}: approximately ${format(row.requests)} Worker requests</title></rect>`).join('');
  const monthlyRows = data.months.map(row => `<tr><th scope="row">${new Date(row.month + '-01').toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })}${row.month === '2026-07' ? ' 2–31' : row.month === '2026-09' ? ' 1–11' : ''}</th><td>~${format(row.requests)}</td><td>${row.month === '2026-09' ? '~' + format(total.search) : 'Unavailable'}</td><td>${row.month === '2026-09' ? '~' + format(total.execute) : 'Unavailable'}</td><td>${row.month === '2026-09' ? '≥' + total.accountsLowerBound : 'Unavailable'}</td><td>${row.month === '2026-09' ? 'Tool data: Sep 4–11 only' : 'Server activity only'}</td></tr>`).join('');
  const windows = data.toolWindows.map(row => `<tr><th scope="row">${escape(row.label)}<br><span class="status">${escape(row.kind)}</span></th><td>${escape(stamp(row.from))}<br>to ${escape(stamp(row.toExclusive))}</td><td>${row.kind === 'estimate' ? '~' : ''}${format(row.search)}</td><td>${row.kind === 'estimate' ? '~' : ''}${format(row.execute)}</td><td>${row.accountsLowerBound == null ? 'Unknown' : (row.kind === 'estimate' ? '≥' : '') + row.accountsLowerBound}</td></tr>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Raven · Launch-to-date report</title><meta name="description" content="Available Raven usage evidence from July 2 through September 11, 2026."><link rel="icon" href="data:,"><link rel="stylesheet" href="/style.css"></head><body>
  <header class="masthead"><div class="brand">raven<span>Launch report</span></div><a class="nav-link" href="/">Live monthly dashboard</a></header>
  <main><div class="heading"><div><p class="eyebrow">JULY 2 — SEPTEMBER 11, 2026</p><h1>From launch to today</h1></div><div class="actions"><a class="button" href="/launch.csv" download>Export CSV</a><a class="button" href="/launch-report.md" download>Download report</a></div></div>
  <p class="report-date">Snapshot: ${escape(stamp(data.generatedAt))} · All dates use UTC</p>
  <div class="notice">We recovered server activity since launch. Complete lifetime tool counts and active-account totals remain unavailable.</div>
  <section class="metrics" aria-label="Available launch-to-date evidence"><article class="metric total"><h2>Worker requests since launch</h2><p>~${format(Math.round(total.requests / 1000))}k</p><span>All server activity · estimated</span></article><article class="metric"><h2>Recovered MCP responses</h2><p>~${format(Math.round((total.search + total.execute) / 10) * 10)}</p><span>September 4–11 evidence only</span></article><article class="metric"><h2>Known active accounts</h2><p>≥${total.accountsLowerBound}</p><span>Lower bound from recovered tool use</span></article><article class="metric"><h2>Full tool-history months</h2><p>0</p><span>July and August tool counts unavailable</span></article></section>
  <section class="panel"><div class="section-head"><div><h2>Available evidence by month</h2><p>Request counts measure all server traffic. Tool columns show only recovered responses.</p></div></div><div class="table-wrap"><table><thead><tr><th>Period · 2026</th><th>Worker requests</th><th>MCP search</th><th>MCP execute</th><th>Active accounts</th><th>Coverage</th></tr></thead><tbody>${monthlyRows}</tbody></table></div></section>
  <section class="panel"><div class="section-head"><div><h2>Server activity since launch</h2><p>Website requests, connection messages, checks, automation, and tool traffic share this series.</p></div><span class="tag">Estimated requests per day</span></div><div class="launch-chart"><svg viewBox="0 0 ${days.length * 12} 205" role="img" aria-label="Daily estimated Worker requests from July 2 through September 11. Daily request counts from the authenticated snapshot.">${bars}<text x="0" y="201">Jul 2</text><text x="360" y="201">Aug 1</text><text x="732" y="201">Sep 1</text></svg></div><p class="chart-help launch-help">The highest daily count is approximately ${format(max)} requests. These records do not identify its cause.</p></section>
  <section class="panel"><div class="section-head"><div><h2>What we recovered for search and execute</h2><p>Windows remain separate to show their sources and account-count limits.</p></div></div><div class="table-wrap"><table><thead><tr><th>Evidence</th><th>Window · UTC, end exclusive</th><th>Search</th><th>Execute</th><th>Active accounts</th></tr></thead><tbody>${windows}</tbody></table></div><p class="chart-help launch-help">The same account can appear in several windows. Adding the account counts would overcount users.</p></section>
  <div class="details-grid"><section class="panel compact"><h2>Coverage from launch</h2><dl><div><dt>July 2 → September 4, 15:00</dt><dd>Server requests only</dd></div><div><dt>September 4 → September 11</dt><dd>Partial tool evidence</dd></div><div><dt>September 11, 14:34 onward</dt><dd>Retained usage archive</dd></div></dl><p>October is the first possible complete tool-history month.</p></section><section class="panel compact"><h2>How to use these numbers</h2><p>Use server requests to describe infrastructure activity. Use recovered tool counts only with their September coverage dates.</p><p>We cannot infer missing answers or users from server requests.</p><p>Counts include logged handler errors and refusals. API-key responses do not count as people.</p></section></div>
  <section class="panel compact"><h2>Independent audit · September 11, 15:36 UTC</h2>${auditLines(data).map(line => `<p>${escape(line)}</p>`).join('')}</section>
  <details class="panel compact"><summary>Sources and measurement limits</summary><ul>${data.notes.map(note => `<li>${escape(note)}</li>`).join('')}</ul><p>Monthly request queries and daily sums agree. Sampling still makes request counts estimates.</p><p><a href="${escape(data.launchSource)}">Repository launch date</a> · <a href="${escape(data.requestSource)}">Cloudflare request metric</a> · <a href="/launch-report.md">Full report and query details</a></p></details>
  <footer><p>This report preserves the available evidence as of ${escape(date(data.generatedAt))}.</p><p>The <a href="/">live monthly dashboard</a> continues to collect and display new usage.</p></footer></main></body></html>`;
}
