/**
 * runSkill — the host dispatch behind `codemode.skill.run` (design §6, §11
 * row 5). Pure module (no cloudflare:workers): the providers wire it up in a
 * later rollout step; unit tests exercise it directly.
 *
 * Resolution ladder — every rung an envelope, nothing throws toward the
 * caller: (1) name must be a non-empty string; (2) exact catalog id lookup,
 * miss names the full runnable set + the store's nearest-id SUGGESTION
 * (never a resolution); (3) an existing-but-not-runnable entry points at
 * skill.read; (4) input validates via the same guard/validateArgs path
 * operations use — model code never owns the contract; (5) registry lookup
 * (belt: unreachable once assertRunnersWired runs at provider build);
 * (6) execute with a recording sub-facade under a host deadline.
 *
 * The audit trail is HOST-owned (design §6): each declared op's facade fn is
 * wrapped to append { op, ok, errorKind?, ms } to a ledger this module owns.
 * `calls` on the output, the error path's `error.details`, and the
 * `skill_run` event counts all come from that ledger — a buggy runner can
 * project a section wrongly, but it cannot make a failed call disappear from
 * the report or corroborate its own lie (its own `calls` key is overwritten
 * unconditionally).
 *
 * Deadline: Promise.race against RUNNER_DEADLINE_MS returns a timeout error
 * envelope on expiry. NOT cancellation — in-flight facade calls continue
 * detached until the request context ends (harmless: free read-only ops,
 * each still logging its own `op` event).
 *
 * Output-schema warn belt: after attaching `calls`, the full data payload is
 * validated against the runner's outputSchema — a mismatch logs
 * outputSchemaOk: false but does NOT fail the run (a defensive projection
 * half-handling upstream drift must surface in telemetry, not ship silently
 * under the advertised type). Ordering note: the design sketch lists the belt
 * before the calls attach; validating AFTER lets the belt check the exact
 * bytes the model receives, including the host-attached `calls` the schema
 * declares.
 */
import type { Catalog, CatalogEntry } from "../catalog/types.ts";
import { lastIdSegment } from "../catalog/id.ts";
import type { AdapterResult } from "../adapters/types.ts";
import { guard } from "../policy/guard.ts";
import { validateArgs } from "../policy/validate.ts";
import { redactSecrets } from "../policy/redact.ts";
import { logEvent } from "../observability.ts";
import { nearestSkillId } from "./store.ts";
import type { OpsFacade, SkillRunner } from "./runners/types.ts";

/**
 * Host-side runner deadline (design §2): generous for ≤ 6 statically bounded
 * free calls, and independent of whether the outer executor's 60 s wall
 * clock covers host dispatch time (that outer timeout remains the hard stop).
 */
export const RUNNER_DEADLINE_MS = 30_000;

/** Exact-match runnability: only the schema's literal `true` counts. */
const isRunnable = (e: CatalogEntry): boolean => e.runnable === true;

/** One ledger row — the exact shape `calls` and the skill_run counts use. */
export type CallRecord = { op: string; ok: boolean; errorKind?: "error" | "soft-empty"; ms: number };

const err = (
  kind: "error" | "soft-empty",
  message: string,
  extra?: { hint?: string; details?: unknown }
): AdapterResult => ({
  ok: false,
  error: {
    service: "skills",
    kind,
    message,
    ...(extra?.hint !== undefined ? { hint: extra.hint } : {}),
    ...(extra?.details !== undefined ? { details: extra.details } : {})
  }
});

/**
 * Build the per-run recording sub-facade: ONLY the runner's declared ops
 * (design §2 — even an exposed-but-undeclared op has no fn here and fails
 * loudly), each wrapped to append to the host-owned ledger before returning
 * the untouched envelope. Namespace/fn naming mirrors the sandbox surface:
 * first id segment → service namespace, terminal segment → fn name.
 */
function buildSubFacade(runner: SkillRunner, facade: OpsFacade, ledger: CallRecord[]): OpsFacade {
  const sub: OpsFacade = {};
  for (const opId of runner.ops) {
    const service = opId.slice(0, opId.indexOf("."));
    const fnName = lastIdSegment(opId);
    const base = facade[service]?.[fnName];
    // Belt only: assertRunnersWired pins declared ops ⊆ manifest ops, and the
    // facade is built FROM the manifest — a hole here means a stale build,
    // and the runner's own missing-fn throw will surface it as a runner-bug
    // envelope rather than silently narrowing the surface.
    if (!base) continue;
    (sub[service] ??= {})[fnName] = async (args?: unknown) => {
      const t0 = Date.now();
      const r = await base(args);
      const record: CallRecord = { op: opId, ok: r.ok, ms: Date.now() - t0 };
      if (!r.ok) record.errorKind = r.error.kind === "soft-empty" ? "soft-empty" : "error";
      ledger.push(record);
      return r;
    };
  }
  return sub;
}

/**
 * Envelope-shaped runner result — expected-condition failures returned as
 * data. A result carrying `ok: false` is ALWAYS treated as a failure claim:
 * when its `error` slot is missing or malformed (a string, a number — a
 * runner bug, exactly the class the belts exist for), it becomes a
 * runner-bug ERROR envelope rather than falling through to the object check
 * and shipping as { ok: true, data: { ok: false, … } } — a success envelope
 * wrapping a failure-shaped payload that would log outcome "ok" and plant
 * the wrong __guardEnvelope traps.
 */
function asErrorEnvelope(raw: unknown): { kind: "error" | "soft-empty"; message: string; hint?: string } | null {
  if (raw === null || typeof raw !== "object") return null;
  const r = raw as { ok?: unknown; error?: unknown };
  if (r.ok !== false) return null;
  if (r.error === null || r.error === undefined || typeof r.error !== "object") {
    return {
      kind: "error",
      message: `runner returned ok: false with a malformed error slot (runner bug): ${JSON.stringify(r.error) ?? "undefined"}`
    };
  }
  const e = r.error as { kind?: unknown; message?: unknown; hint?: unknown };
  return {
    kind: e.kind === "soft-empty" ? "soft-empty" : "error",
    message: typeof e.message === "string" ? e.message : "runner returned an unspecified error",
    ...(typeof e.hint === "string" ? { hint: e.hint } : {})
  };
}

/**
 * Canonical (key-sorted, recursive) stringify for the schema-equality check
 * below. scripts/build-catalog.mjs emits the manifest through sortKeysDeep
 * for byte-deterministic artifacts, so the manifest copy of a runner schema
 * is the SAME data in a different key order than the bundled object literal —
 * raw JSON.stringify equality (the design's first sketch) false-alarms on
 * every real build. Canonicalizing both sides keeps the intended property —
 * any SEMANTIC drift (added/removed/changed keys or values) still throws —
 * without demanding an ordering the emitter deliberately does not preserve.
 */
function canonicalJson(value: unknown): string {
  const sort = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(sort);
    if (v !== null && typeof v === "object") {
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(v as Record<string, unknown>).sort()) {
        out[key] = sort((v as Record<string, unknown>)[key]);
      }
      return out;
    }
    return v;
  };
  return JSON.stringify(sort(value));
}

/**
 * Startup wiring assertion (design §5/§11 row 5) — called at provider build,
 * THROWS on any mismatch so the first execute fails loudly, never silently:
 *  - every registry key resolves to an emitted skill entry with runnable: true;
 *  - every manifest-runnable entry has a bundled runner;
 *  - deep schema equality per id (canonicalJson above — generated data, so
 *    key-order-insensitive string equality suffices): id-set equality alone
 *    would let a stale manifest validate input against a DIFFERENT schema
 *    than the bundled runner expects (widened registry + stale manifest =
 *    spurious refusals; narrowed = unvalidated shapes reaching run());
 *  - every declared op resolves to an emitted operation entry.
 */
export function assertRunnersWired(catalog: Catalog, registry: Record<string, SkillRunner>): void {
  const byId = new Map(catalog.entries.map((e) => [e.id, e]));
  const opIds = new Set(catalog.entries.filter((e) => e.kind === "operation").map((e) => e.id));
  for (const [id, runner] of Object.entries(registry)) {
    const entry = byId.get(id);
    if (!entry || entry.kind !== "skill" || !isRunnable(entry)) {
      throw new Error(
        `runner registry is out of sync with the catalog: "${id}" has no runnable skill entry in the manifest — rebuild the catalog (npm run build) or drop the runner`
      );
    }
    if (canonicalJson(entry.inputSchema) !== canonicalJson(runner.inputSchema)) {
      throw new Error(
        `runnable skill "${id}": manifest inputSchema differs from the bundled runner's — stale catalog/manifest.json; rebuild the catalog`
      );
    }
    if (canonicalJson(entry.outputSchema) !== canonicalJson(runner.outputSchema)) {
      throw new Error(
        `runnable skill "${id}": manifest outputSchema differs from the bundled runner's — stale catalog/manifest.json; rebuild the catalog`
      );
    }
    for (const opId of runner.ops) {
      if (!opIds.has(opId)) {
        throw new Error(
          `runnable skill "${id}" declares op "${opId}" which is not an emitted operation entry — upstream retirement or exposure drift; rebuild and reconcile the runner's declared ops`
        );
      }
    }
  }
  for (const entry of catalog.entries) {
    if (isRunnable(entry) && !registry[entry.id]) {
      throw new Error(
        `catalog marks "${entry.id}" runnable but no runner is bundled under that id — registry and manifest are out of sync; rebuild`
      );
    }
  }
}

/**
 * Execute a runnable skill. Returns the service-call envelope:
 * { ok: true, data: <output + host-attached calls> } | { ok: false, error }.
 * `deps.secrets` feeds the aggregate redaction belt (constituent results are
 * already redacted by the facade closures; this catches runner-composed
 * strings that interleave them).
 */
export async function runSkill(
  catalog: Catalog,
  registry: Record<string, SkillRunner>,
  facade: OpsFacade,
  name: unknown,
  input: unknown,
  deps?: { secrets?: string[] }
): Promise<AdapterResult> {
  const t0 = Date.now();
  const secrets = deps?.secrets ?? [];
  const ledger: CallRecord[] = [];
  let outputSchemaOk = true;

  /** Single exit point: every outcome logs one flat skill_run event (§8). */
  const finish = (id: string, result: AdapterResult): AdapterResult => {
    logEvent("skill_run", {
      id,
      outcome: result.ok ? "ok" : result.error.kind,
      ms: Date.now() - t0,
      calls: ledger.length,
      callsOk: ledger.filter((c) => c.ok).length,
      callsError: ledger.filter((c) => c.errorKind === "error").length,
      callsSoftEmpty: ledger.filter((c) => c.errorKind === "soft-empty").length,
      outputSchemaOk
    });
    return redactSecrets(result, secrets);
  };

  // (1) name discipline — mirror readSkill's message shape.
  if (typeof name !== "string" || name.length === 0) {
    return finish("", err("error", "skill name must be a non-empty string (an exact catalog id)"));
  }

  const runnableIds = catalog.entries.filter(isRunnable).map((e) => e.id);
  const runnableList = runnableIds.join(", ");

  // (2) exact id lookup — miss names the full runnable set (tiny, and every
  // listed id is exposed: ADR-0003-clean) plus a nearest-id SUGGESTION
  // computed over runnable entries only.
  const entry = catalog.entries.find((e) => e.id === name);
  if (!entry) {
    const runnableOnly = { ...catalog, entries: catalog.entries.filter(isRunnable) };
    const nearest = nearestSkillId(runnableOnly, name);
    return finish(
      name,
      err(
        "error",
        `unknown runnable skill "${name}" — runnable ids (exact-match): ${runnableList}${nearest ? `. Did you mean "${nearest}"?` : ""}`
      )
    );
  }

  // (3) exists but not runnable (a prose skill, an operation, a section id).
  if (entry.kind !== "skill" || !isRunnable(entry)) {
    return finish(
      entry.id,
      err(
        "error",
        `"${entry.id}" is not runnable — runnable skills (exact-match): ${runnableList}; to read a skill use codemode.skill.read`
      )
    );
  }

  // (4) input validation — the SAME guard/validateArgs path operations use,
  // against the manifest entry's schema (assertRunnersWired pins it equal to
  // the bundled runner's).
  const refused = guard(entry, input);
  if (refused) return finish(entry.id, refused);

  // (5) registry lookup — belt; unreachable once assertRunnersWired runs at
  // provider build, kept for hand-built catalogs and partial deploys.
  const runner = registry[entry.id];
  if (!runner) {
    return finish(
      entry.id,
      err(
        "error",
        `${entry.id} is runnable in the catalog but its runner is missing from this build — registry/manifest drift; rebuild and redeploy`
      )
    );
  }

  // (6) run under the host deadline with the recording sub-facade.
  const sub = buildSubFacade(runner, facade, ledger);
  const inputObj = (input ?? {}) as Record<string, unknown>;
  const DEADLINE = Symbol("runner-deadline");
  let timer: ReturnType<typeof setTimeout> | undefined;
  let raw: unknown;
  try {
    raw = await Promise.race([
      runner.run(inputObj, sub),
      new Promise<typeof DEADLINE>((resolve) => {
        timer = setTimeout(() => resolve(DEADLINE), RUNNER_DEADLINE_MS);
      })
    ]);
  } catch (e) {
    // A throw is a runner BUG (expected conditions are data) — mirror
    // caughtResult: error-as-data, never an exception toward the caller.
    const message = e instanceof Error ? e.message : String(e);
    return finish(
      entry.id,
      err("error", `runner ${entry.id} threw (runner bug): ${message}`, { details: [...ledger] })
    );
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }

  if (raw === DEADLINE) {
    return finish(
      entry.id,
      err(
        "error",
        `runner ${entry.id} exceeded the ${RUNNER_DEADLINE_MS} ms host deadline — in-flight constituent calls continue detached; retry with narrower limits`,
        { details: [...ledger] }
      )
    );
  }

  // Expected-condition failure returned as data (ambiguity, soft-empty
  // anchor, anchor error): pass the envelope through, but the attribution is
  // host-owned — error.details carries the LEDGER's calls, whatever the
  // runner put there (design §6).
  const runnerError = asErrorEnvelope(raw);
  if (runnerError) {
    return finish(
      entry.id,
      err(runnerError.kind, runnerError.message, {
        ...(runnerError.hint !== undefined ? { hint: runnerError.hint } : {}),
        details: [...ledger]
      })
    );
  }

  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return finish(
      entry.id,
      err("error", `runner ${entry.id} returned a non-object result (runner bug)`, {
        details: [...ledger]
      })
    );
  }

  // Attach `calls` from the host ledger, overwriting any runner-set key
  // unconditionally (the audit trail is never runner-authored), THEN the
  // output-schema warn belt over the exact payload the model receives.
  const data: Record<string, unknown> = { ...(raw as Record<string, unknown>), calls: [...ledger] };
  const issues = validateArgs(runner.outputSchema, data);
  if (issues.length > 0) {
    outputSchemaOk = false;
    logEvent("skill_run_schema_mismatch", {
      id: entry.id,
      issueCount: issues.length
    });
  }

  return finish(entry.id, { ok: true, data });
}
