const formatter = new Intl.NumberFormat('en-US');
export const number = value => value == null ? '—' : formatter.format(value);
export const monthName = value => new Date(`${value}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
export function availableMonths(data) {
  const start = new Date(Math.max(Date.parse('2026-07-01T00:00:00Z'), Date.parse(data.retainedFrom)));
  const end = data.generatedAt.slice(0, 7), months = [];
  while (start.toISOString().slice(0, 7) <= end) {
    months.push(start.toISOString().slice(0, 7));
    start.setUTCMonth(start.getUTCMonth() + 1);
  }
  return months.reverse();
}
export function expectedChecks(data, month) {
  const start = Math.max(Date.parse(`${month}-01T00:00:00Z`), Date.parse(data.archiveStart));
  const endDate = new Date(`${month}-01T00:00:00Z`);
  endDate.setUTCMonth(endDate.getUTCMonth() + 1);
  // Allow ten minutes for the hourly check and tail ingestion.
  const end = Math.min(endDate.getTime(), Date.parse(data.generatedAt) - 10 * 60000);
  let count = 0;
  for (let hour = Math.floor(start / 3600000) * 3600000; hour < end; hour += 3600000) {
    if (hour + 7 * 60000 >= start && hour + 7 * 60000 < end) count++;
  }
  return count;
}
export function monthly(data, month, surface) {
  const receipts = data.receipts.filter(row => row.day.startsWith(month));
  const row = data.months.find(row => row.period === month && row.surface === surface);
  const totals = row || (receipts.length ? {
    search_responses: 0, execute_responses: 0, total_responses: 0, unique_accounts: 0,
    api_key_responses: 0, dev_responses: 0, unattributed_responses: 0
  } : {});
  const checks = receipts.reduce((sum, row) => sum + row.canary_hours, 0);
  const expected = expectedChecks(data, month);
  const truncated = receipts.reduce((sum, row) => sum + row.truncated_invocations, 0);
  const missing = receipts.reduce((sum, row) => sum + (row.missing_response_ids || 0), 0);
  const failed = receipts.reduce((sum, row) => sum + (row.failed_statements || 0), 0);
  const interrupted = receipts.reduce((sum, row) => sum + (row.interrupted_invocations || 0), 0);
  const current = month === data.generatedAt.slice(0, 7);
  let status = 'Recorded';
  if (!receipts.length && !row) status = 'Unavailable';
  else if (current) status = 'In progress';
  else if (month === data.archiveStart.slice(0, 7)) status = 'Partial month';
  else if (checks < expected || truncated || missing || failed) status = 'Check coverage';
  return { ...totals, receipts, checks, expected, truncated, missing, failed, interrupted, status };
}
export function csv(data, surface) {
  const lines = [['Month', 'Source', 'Search responses', 'Execute responses', 'Total responses', 'Active accounts', 'API-key responses', 'Unattributed responses', 'Development responses', 'Coverage', 'Generated at UTC']];
  for (const month of availableMonths(data)) {
    const row = monthly(data, month, surface);
    lines.push([month, surface, row.search_responses, row.execute_responses, row.total_responses, row.unique_accounts,
      row.api_key_responses, row.unattributed_responses, row.dev_responses, row.status, data.generatedAt]);
  }
  return lines.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
}

if (typeof document !== 'undefined') {
  const $ = id => document.getElementById(id);
  let data, loading = false;
  const timestamp = value => value ? new Date(value).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC'
  }) + ' UTC' : 'No check recorded';
  const text = (id, value) => { $(id).textContent = value; };

  function renderChart(month, surface) {
    const container = $('chart');
    container.replaceChildren();
    const rows = data.days.filter(row => row.period.startsWith(month) && row.surface === surface);
    const coveredDays = new Set(data.receipts.map(row => row.day));
    const [year, monthNumber] = month.split('-').map(Number);
    const days = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    if (!rows.length && !data.receipts.some(row => row.day.startsWith(month))) {
      const message = document.createElement('p'); message.className = 'empty';
      message.textContent = 'No archived data exists for this month.'; container.append(message); return;
    }
    const max = Math.max(1, ...rows.map(row => row.total_responses));
    const grid = document.createElement('div'); grid.className = 'chart-grid';
    for (let day = 1; day <= days; day++) {
      const date = `${month}-${String(day).padStart(2, '0')}`;
      const future = date > data.generatedAt.slice(0, 10);
      const row = rows.find(row => row.period === date);
      const missing = !future && !row && !coveredDays.has(date);
      const button = document.createElement('button'); button.className = 'bar-day' + (missing ? ' missing' : '');
      const summary = future ? `${date}: future date.` : missing ? `${date}: no recorded coverage.` : `${date}: ${number(row?.search_responses ?? 0)} search, ${number(row?.execute_responses ?? 0)} execute responses.`;
      button.title = summary; button.setAttribute('aria-label', summary);
      button.onclick = () => text('chart-note', summary);
      const stack = document.createElement('span'); stack.className = 'bar-stack';
      if (!missing) stack.style.height = `${(row?.total_responses ?? 0) / max * 100}%`;
      for (const [tool, count] of [['search', row?.search_responses ?? 0], ['execute', row?.execute_responses ?? 0]]) {
        const bar = document.createElement('span'); bar.className = tool;
        bar.style.height = `${count / (row?.total_responses || 1) * 100}%`; stack.append(bar);
      }
      if (future) stack.style.visibility = 'hidden';
      const label = document.createElement('span'); label.className = 'bar-label';
      label.textContent = day === 1 || day % 5 === 0 || day === days ? String(day) : '';
      button.append(stack, label); grid.append(button);
    }
    container.append(grid);
  }

  function render() {
    const month = $('month').value, surface = $('surface').value;
    const row = monthly(data, month, surface);
    for (const [id, field] of Object.entries({ total: 'total_responses', search: 'search_responses', execute: 'execute_responses', accounts: 'unique_accounts', 'api-key': 'api_key_responses', unattributed: 'unattributed_responses', dev: 'dev_responses' })) text(id, number(row[field]));
    text('coverage', row.status === 'Unavailable'
      ? `${monthName(month)} has no archived data. Missing data does not mean zero usage.`
      : month === data.archiveStart.slice(0, 7)
        ? 'Partial September: the archive starts September 11 at 14:34 UTC. Historical estimates appear separately below.'
        : row.status === 'In progress' ? 'This month is still in progress. Counts show the available archive through the last refresh.'
          : 'Counts show the available archive. Check collection coverage before comparing months.');
    text('chart-note', `Daily counts in UTC · highest daily total: ${number(Math.max(0, ...data.days.filter(r => r.period.startsWith(month) && r.surface === surface).map(r => r.total_responses)))}`);
    renderChart(month, surface);
    const table = $('months'); table.replaceChildren();
    for (const period of availableMonths(data)) {
      const item = monthly(data, period, surface), tr = document.createElement('tr');
      if (period === month) tr.className = 'selected';
      const first = document.createElement('td'), button = document.createElement('button');
      button.textContent = monthName(period); button.setAttribute('aria-label', `View ${monthName(period)}`);
      if (period === month) button.setAttribute('aria-current', 'true');
      button.onclick = () => { $('month').value = period; render(); }; first.append(button); tr.append(first);
      for (const field of ['search_responses', 'execute_responses', 'total_responses', 'unique_accounts']) {
        const cell = document.createElement('td'); cell.textContent = number(item[field]); tr.append(cell);
      }
      const status = document.createElement('td'); status.className = 'status' + (item.status !== 'Recorded' ? ' partial' : '');
      status.textContent = item.status; tr.append(status); table.append(tr);
    }
    const lastCanary = Math.max(0, ...row.receipts.map(row => row.last_canary_ms || 0));
    text('canary', timestamp(lastCanary));
    text('checks', `${number(row.checks)} / ${number(row.expected)} expected`);
    text('truncated', row.receipts.length ? number(row.truncated) : '—');
    text('health', row.status === 'Unavailable' ? 'No collection records exist for this month.'
      : row.expected === 0 ? 'No hourly collection check is due yet.'
        : row.checks < row.expected || row.truncated ? 'Some collection checks or log records are missing. Counts can contain gaps.'
          : 'Collection checks are present. These checks cannot prove that every response was recorded.');
    if (row.receipts.length) text('health', $('health').textContent + ` Interrupted invocations: ${number(row.interrupted)}. Missing response identifiers: ${number(row.missing)}. Failed writes: ${number(row.failed)}.`);
    document.querySelector('.metrics').setAttribute('aria-busy', 'false');
    $('export').disabled = false;
  }

  async function refresh() {
    if (loading) return;
    loading = true; $('refresh').disabled = true; text('refresh', 'Refreshing…');
    try {
      const response = await fetch('/api/report', { cache: 'no-store', signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error('Report unavailable');
      const next = await response.json();
      if (next.schema !== 1 || !Array.isArray(next.months) || !Array.isArray(next.days) || !Array.isArray(next.receipts)) throw new Error('Invalid report');
      data = next;
      const previous = $('month').value, months = availableMonths(data);
      $('month').replaceChildren(...months.map(value => { const option = document.createElement('option'); option.value = value; option.textContent = monthName(value); return option; }));
      $('month').value = months.includes(previous) ? previous : months[0]; $('month').disabled = false;
      text('updated', `Updated ${timestamp(data.generatedAt)} · refreshes every minute`);
      $('error').hidden = true; render();
    } catch {
      text('error', data ? 'Refresh failed. The report still shows the last successful update. Select Refresh data to retry.' : 'The archive is unavailable. Select Refresh data to retry.');
      $('error').hidden = false;
      if (!data) { text('updated', 'No data loaded'); text('chart', 'Daily counts are unavailable.'); text('health', 'Collection checks are unavailable.'); }
    } finally { loading = false; $('refresh').disabled = false; text('refresh', 'Refresh data'); }
  }
  $('month').onchange = () => data && render();
  $('surface').onchange = () => data && render();
  $('refresh').onclick = refresh;
  $('export').onclick = () => {
    if (!data) return;
    const url = URL.createObjectURL(new Blob([csv(data, $('surface').value)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url;
    link.download = `raven-usage-${$('surface').value}-${data.generatedAt.slice(0, 10)}.csv`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  refresh();
  setInterval(() => { if (!document.hidden) refresh(); }, 60000);
}
