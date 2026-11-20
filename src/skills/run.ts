/**
 * Host dispatch behind `codemode.skill.run` (src/skills/README.md). Pure module (no `cloudflare:workers`).
 * Runs exact-id lookup, host-side input validation, a recording sub-facade restricted to declared ops,
 * a `RUNNER_DEADLINE_MS` race (does not cancel in-flight read-only calls), unconditional host-ledger
 * `calls` attachment, and a warn-only output-schema check over the final payload.
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
 * Host-side runner deadline; declared calls remain bounded by each runner.
 * This deadline is independent of whether the outer executor's 60 s wall
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

/** Narrow facade to the runner's declared ops and record every call in the host ledger. */
function buildSubFacade(runner: SkillRunner, facade: OpsFacade, ledger: CallRecord[]): OpsFacade {
  const sub: OpsFacade = {};
  for (const opId of runner.ops) {
    const service = opId.slice(0, opId.indexOf("."));
    const fnName = lastIdSegment(opId);
    const base = facade[service]?.[fnName];
    // Belt: assertRunnersWired checks declared ops at startup; skipping lets the runner fail loudly on stale builds.
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
 * Treat any `{ ok: false }` return as a failure even if `error` is malformed,
 * so a buggy runner cannot ship `{ ok: true, data: { ok: false, ... } }`.
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

/** Key-sorted JSON string so manifest schemas (sorted by build-catalog) compare cleanly with literal schemas. */
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
 * Verify registry and catalog parity at provider build (throws on drift):
 * runnable ids match both ways, input/output schemas match deeply, and every declared op is exposed.
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

  /** Single exit point: every outcome logs one flat skill_run event. */
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
  // runner put there (src/skills/README.md).
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
