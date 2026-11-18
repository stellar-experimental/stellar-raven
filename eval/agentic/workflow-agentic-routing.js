export const meta = {
  name: 'agentic-routing-eval',
  description: 'Sonnet sub-agents (low+medium effort) pick tools via live MCP search; graded vs golden labels',
  phases: [
    { title: 'Ask', detail: '30 questions x 2 efforts, Sonnet agents against live /mcp' },
  ],
}

const input = typeof args === 'string' ? JSON.parse(args) : args
const { port, cases } = input
const VERDICT = {
  type: 'object',
  properties: {
    queriesUsed: { type: 'array', items: { type: 'string' } },
    searchCalls: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'number' },
          hits: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                tier: { type: 'string' },
                score: { type: 'number' },
              },
              required: ['id', 'tier', 'score'],
              additionalProperties: false,
            },
          },
          total: { type: 'number' },
          truncated: { type: 'boolean' },
          zeroGated: { type: 'boolean' },
          widerCandidateIds: { type: 'array', items: { type: 'string' } },
        },
        required: ['query', 'limit', 'hits', 'total', 'truncated', 'zeroGated', 'widerCandidateIds'],
        additionalProperties: false,
      },
    },
    primaryToolId: { type: 'string' },
    primaryService: { type: 'string', enum: ['lumenloop', 'scout', 'stellarDocs', 'skills', 'none'] },
    alternateToolIds: { type: 'array', items: { type: 'string' } },
    reasoning: { type: 'string' },
  },
  required: ['queriesUsed', 'searchCalls', 'primaryToolId', 'primaryService', 'reasoning'],
  additionalProperties: false,
}

function prompt(c, effort) {
  return `You are an AI agent connected to an MCP server that unifies Stellar-ecosystem tools (services: lumenloop = Stellar content/directory/research platform; scout = Stellar Light project/repo/builder/partner data; stellarDocs = official Stellar developer docs search; skills = reference playbooks/guides).

A user asked: "${c.question}"

Discover which tools exist by calling the server's search tool with curl via Bash. Exact command (replace QUERY only; keep the quoting and every header EXACTLY as written — the X-Eval-Agent header is required for the run to count):
curl -s http://localhost:${port}/mcp -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H 'X-Eval-Agent: ${c.id}:${effort}' -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search","arguments":{"query":"QUERY","limit":8}}}'
The response is an SSE frame: take the line starting with "data: ", parse it as JSON, then parse result.content[0].text as JSON to get {hits:[{id,service,kind,tier,score,description,signature}],total,truncated,widerCandidates:[{id,...}]}.

Rules: 1-3 search calls total, different query phrasings allowed. For every call, record a searchCalls entry with its query, limit, hits in returned order as {id,tier,score}, total, truncated, zeroGated (true when no returned hit has tier "gated"), and widerCandidateIds. Pick the ONE tool id you would actually invoke to answer the user (prefer kind "operation" when an operation can answer; a skill/skill-section only if reference reading is genuinely the right answer). Then report via structured output: queriesUsed, searchCalls, primaryToolId (an exact id from the hits), primaryService (the service of that tool), alternateToolIds (0-3 backups), reasoning (1-2 sentences). Do not answer the user's question itself.`
}

phase('Ask')
const jobs = []
for (const c of cases) {
  for (const effort of ['low', 'medium']) {
    jobs.push({ c, effort })
  }
}
log(`${jobs.length} agent runs (${cases.length} cases x low/medium)`)

const results = await parallel(jobs.map(({ c, effort }) => () =>
  agent(prompt(c, effort), {
    label: `${effort}:${c.id}`,
    model: 'sonnet',
    effort,
    schema: VERDICT,
  }).then(v => {
    // zeroGated is derived here, never trusted from the agent: the first live run
    // showed agents mislabeling it in both directions on 3 of 13 pages.
    const searchCalls = v.searchCalls.map(call => ({
      ...call,
      zeroGated: !call.hits.some(hit => hit.tier === 'gated'),
    }))
    return {
      caseId: c.id,
      question: c.question,
      expected: c.expected_service,
      effort,
      verdict: v,
      searchCalls,
      primaryInHits: searchCalls.some(call => call.hits.some(hit => hit.id === v.primaryToolId)),
    }
  })
    .catch(() => null)
))

const rows = results.filter(Boolean).filter(r => r.verdict)
// Grading rule v3 (ADR-0003 — mirrors eval/lib/grade.mjs): the manifest contains no
// lumenloop.skill.* twins, so there is no twin identity — a pick's service label is
// exactly its own. Cross-service tolerance belongs in expected_any, not the grader.
const grade = rs => {
  const n = rs.length
  const primary = r => r.verdict.primaryService === r.expected
  const primaryHit = rs.filter(primary).length
  const anyHit = rs.filter(r =>
    primary(r) ||
    (r.verdict.alternateToolIds || []).some(id => String(id).split('.')[0] === r.expected)
  ).length
  return { n, primaryHit, primaryPct: n ? +(100 * primaryHit / n).toFixed(1) : 0, anyHit, anyPct: n ? +(100 * anyHit / n).toFixed(1) : 0 }
}
const summary = {}
for (const effort of ['low', 'medium']) {
  const sub = rows.filter(r => r.effort === effort)
  summary[effort] = { overall: grade(sub) }
  for (const svc of ['lumenloop', 'scout', 'stellarDocs']) {
    summary[effort][svc] = grade(sub.filter(r => r.expected === svc))
  }
}
log(`graded ${rows.length}/${jobs.length} runs`)
return { summary, rows }
