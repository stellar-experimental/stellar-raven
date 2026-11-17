/**
 * Item 4.1: what each client's stdout and own logs say about one row: the final answer, the
 * token usage, and whether the documented token identity holds. Shared by run-client.mjs (cap
 * accounting) and read-behaviours.mjs, so both read a row the same way.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export function readJsonl(file) {
  if (!existsSync(file)) return [];
  const out = [];
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      // a killed client can leave a partial last line
    }
  }
  return out;
}

export function findFiles(dir, test, found = []) {
  if (!existsSync(dir)) return found;
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) findFiles(p, test, found);
    else if (test(p)) found.push(p);
  }
  return found;
}

const sum = (rows, k) => rows.reduce((a, r) => a + (r?.[k] ?? 0), 0);

function parseCodex({ rowDir, clientHome }) {
  const events = readJsonl(path.join(rowDir, "stdout.jsonl"));
  const turns = events.filter((e) => e.type === "turn.completed" && e.usage).map((e) => e.usage);
  let usage = null;
  if (turns.length) {
    usage = {
      input: sum(turns, "input_tokens"), cachedInput: sum(turns, "cached_input_tokens"),
      cacheWrite: sum(turns, "cache_write_input_tokens"), output: sum(turns, "output_tokens"),
      reasoning: sum(turns, "reasoning_output_tokens"), source: "turn.completed"
    };
  }
  // The rollout's last token_count is the source for a killed row and the identity check.
  const rollout = findFiles(path.join(clientHome, "sessions"), (p) => /rollout-.*\.jsonl$/.test(p))[0];
  let total = null;
  if (rollout) {
    for (const o of readJsonl(rollout)) {
      const t = o.payload?.type === "token_count" ? o.payload.info?.total_token_usage : null;
      if (t) total = t;
    }
  }
  let identityOk = null;
  if (total) {
    identityOk = total.total_tokens === total.input_tokens + total.output_tokens;
    if (!usage) {
      usage = {
        input: total.input_tokens, cachedInput: total.cached_input_tokens, cacheWrite: total.cache_write_input_tokens ?? 0,
        output: total.output_tokens, reasoning: total.reasoning_output_tokens ?? 0, source: "rollout token_count (partial)"
      };
    } else if (total.input_tokens !== usage.input || total.output_tokens !== usage.output) {
      identityOk = false;
    }
  }
  let answer = null;
  for (const e of events) if (e.type === "item.completed" && e.item?.type === "agent_message") answer = e.item.text;
  return { usage, identityOk, answer };
}

function parseGrok({ rowDir }) {
  const events = readJsonl(path.join(rowDir, "stdout.jsonl"));
  const end = [...events].reverse().find((e) => e.type === "end" && e.usage);
  const per = events.filter((e) => e.type === "usage" && e.usage).map((e) => e.usage);
  let usage = null;
  let identityOk = null;
  if (end) {
    const u = end.usage;
    usage = {
      input: u.input_tokens ?? 0, cacheRead: u.cache_read_input_tokens ?? 0, cacheCreation: u.cache_creation_input_tokens ?? 0,
      output: u.output_tokens ?? 0, reasoning: u.reasoning_tokens ?? 0, cliCostUsd: end.total_cost_usd ?? null, source: "end"
    };
    identityOk = u.total_tokens === usage.input + usage.cacheRead + usage.cacheCreation + usage.output;
    const perIn = sum(per, "input_tokens");
    if (per.length && (perIn !== usage.input || sum(per, "output_tokens") !== usage.output)) identityOk = false;
  } else if (per.length) {
    usage = {
      input: sum(per, "input_tokens"), cacheRead: sum(per, "cache_read_input_tokens"), cacheCreation: sum(per, "cache_creation_input_tokens"),
      output: sum(per, "output_tokens"), reasoning: sum(per, "reasoning_tokens"), cliCostUsd: null, source: "usage lines (partial)"
    };
  }
  // The final message is the text after the last tool call.
  let lastTool = -1;
  events.forEach((e, i) => {
    if (e.type === "tool_call" || e.type === "tool_call_update") lastTool = i;
  });
  const answer = events.slice(lastTool + 1).filter((e) => e.type === "text").map((e) => e.data ?? "").join("");
  return { usage, identityOk, answer: answer || null };
}

function parseOpencode({ rowDir }) {
  const events = readJsonl(path.join(rowDir, "stdout.jsonl"));
  const steps = events.map((e) => e.part ?? e).filter((p) => p?.type === "step-finish" || p?.type === "step_finish");
  let usage = null;
  if (steps.length) {
    const t = steps.map((p) => p.tokens ?? {});
    usage = {
      input: sum(t, "input"), output: sum(t, "output"), reasoning: sum(t, "reasoning"),
      cacheRead: t.reduce((a, x) => a + (x.cache?.read ?? 0), 0), cacheWrite: t.reduce((a, x) => a + (x.cache?.write ?? 0), 0),
      source: "step-finish parts"
    };
  }
  const texts = events.map((e) => e.part ?? e).filter((p) => p?.type === "text").map((p) => p.text ?? "");
  return { usage, identityOk: usage ? true : null, answer: texts.length ? texts[texts.length - 1] : null };
}

export function parseClientOutput(client, ctx) {
  if (client === "codex") return parseCodex(ctx);
  if (client === "grok") return parseGrok(ctx);
  if (client === "opencode") return parseOpencode(ctx);
  throw new Error(`unknown client ${client}`);
}

/** Subscription-equivalent cost at list price, per the plan's per-CLI formulas. Null without usage. */
export function costOf(client, usage, price) {
  if (!usage) return null;
  const M = 1e6;
  let usd;
  if (client === "codex") {
    const fresh = usage.input - usage.cachedInput - usage.cacheWrite;
    usd = (fresh * price.input + usage.cachedInput * price.cachedInput + usage.cacheWrite * (price.cacheWrite ?? price.input) + usage.output * price.output) / M;
  } else if (client === "grok") {
    usd = (usage.input * price.input + usage.cacheRead * price.cachedInput + usage.cacheCreation * price.input + usage.output * price.output) / M;
    if (usage.cliCostUsd != null) usd = Math.max(usd, usage.cliCostUsd);
  } else {
    usd = (usage.input * price.input + usage.cacheRead * price.cachedInput + usage.cacheWrite * (price.cacheWrite ?? price.input) + usage.output * price.output) / M;
  }
  return usd;
}
