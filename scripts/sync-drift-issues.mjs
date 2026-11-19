#!/usr/bin/env node
/**
 * sync-drift-issues.mjs — build per-kind drift reports and reconcile GitHub
 * `drift` issues (one open issue per `<class>:<source>` key).
 *
 * Subcommands:
 *   node scripts/sync-drift-issues.mjs collect --out drift-report.json [options]
 *   node scripts/sync-drift-issues.mjs sync --report drift-report.json [--dry-run] [--json] [options]
 *
 * Key model:
 *   Every managed drift issue carries a hidden HTML marker on line 1 of its
 *   body and of each automated update comment:
 *     <!-- raven-drift key=<class>:<source> fingerprint=<sha256> -->
 *   - Open: when a key drifts and no open keyed issue exists for it.
 *   - Update: when a key drifts and an open keyed issue exists, post a comment
 *     ONLY if the key's canonical report fingerprint changed since the last
 *     drift marker (latest marker-bearing comment, else issue body).
 *   - Close: when an open keyed issue's key no longer drifts AND its owning
 *     check completed cleanly (never close on a check error), comment the
 *     clearing run URL and close with reason `completed`.
 *   - Ignore: unkeyed legacy `drift` issues are left untouched.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DIRECTORY_SOURCE_IDS } from "./check-skills-drift.mjs";
import { collectInventoryDrift } from "./summarize-live-drift.mjs";

export const MARKER_PREFIX = "raven-drift";
const MARKER_LINE_RE = /^<!--\s*raven-drift\s+key=([a-z0-9][a-z0-9:._-]*)(?:\s+fingerprint=([0-9a-f]{64}))?\s*-->$/i;
const VALID_SKILL_STATUSES = new Set(["ok", "DRIFT", "error", "skipped"]);
const MAX_BODY_CHARS = 60_000;
const DRIFT_LABEL = "drift";
const DRIFT_LABEL_COLOR = "D93F0B";
const DRIFT_LABEL_DESCRIPTION = "live service surface drifted from committed inventory";

function sha256(value) {
  return createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = stable(value[key]);
    return out;
  }
  return value;
}

export function formatMarker(key, fingerprint) {
  return `<!-- ${MARKER_PREFIX} key=${key} fingerprint=${fingerprint} -->`;
}

export function parseDriftMarker(text) {
  if (typeof text !== "string" || !text) return null;
  // Managed issues and automated comments always place the marker on line 1
  // (matching dependency-audit.yml and golden-sentinels.yml), so examples
  // quoted later in a legacy issue body or code fence cannot match.
  const firstLine = text.split(/\r?\n/, 1)[0].trim();
  const match = firstLine.match(MARKER_LINE_RE);
  if (!match) return null;
  return { key: match[1].toLowerCase(), fingerprint: match[2] ? match[2].toLowerCase() : null };
}

export function parseDriftKey(key) {
  if (typeof key !== "string") return null;
  const idx = key.indexOf(":");
  if (idx <= 0 || idx === key.length - 1) return null;
  return { driftClass: key.slice(0, idx), source: key.slice(idx + 1) };
}

function truncateBody(text, maxChars = MAX_BODY_CHARS) {
  if (text.length <= maxChars) return text;
  const notice = "\n\n_(truncated to stay within GitHub issue body limits; inspect the workflow run logs for full output)_\n";
  return `${text.slice(0, Math.max(0, maxChars - notice.length))}${notice}`;
}

function renderKeyedBody({ key, fingerprint, heading, runUrl, sections }) {
  const lines = [formatMarker(key, fingerprint), "", `### ${heading}`];
  if (runUrl) lines.push("", `Run: ${runUrl}`);
  for (const section of sections) {
    if (section !== null && section !== undefined) lines.push("", section);
  }
  return truncateBody(`${lines.join("\n")}\n`);
}

function normalizePinOutput(raw) {
  const lines = String(raw ?? "")
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);
  // check-mirrors.mjs resolves pins concurrently with Promise.all, so failure
  // bullet order can vary across runs. Sort bullet lines for deterministic
  // display and fingerprinting.
  const bullets = lines.filter((line) => line.startsWith("- ")).sort();
  const nonBullets = lines.filter((line) => !line.startsWith("- "));
  return {
    canonical: [...nonBullets, ...bullets].join("\n"),
    display: [...nonBullets, ...bullets].join("\n") || "(no pin-availability output)"
  };
}

function normalizeGospelOutput(raw) {
  const lines = String(raw ?? "")
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);
  // eval/qa/lint-corpus.mjs appends `(today YYYY-MM-DD)` to every [stale] line.
  // Strip that daily date from the fingerprint so an unchanged overdue queue
  // does not post a new comment every day.
  const staleLines = lines
    .filter((line) => line.includes("[stale]"))
    .map((line) => line.replace(/\s*\(today \d{4}-\d{2}-\d{2}\)/g, "").trim())
    .sort();
  const canonical = staleLines.length > 0 ? staleLines.join("\n") : lines.join("\n");
  return {
    canonical,
    display: lines.join("\n") || "(no stale-gospel output)"
  };
}

function normalizeCanaryForFingerprint(state, raw) {
  const trimmed = String(raw ?? "").trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      if (state === "failing") {
        // Omit volatile hourly checkedAt and latency ms so a persisting outage
        // with the same error class does not post daily comments.
        return stable({
          state,
          ok: parsed.ok ?? null,
          error: parsed.error ?? null,
          checked: parsed.checked ?? null
        });
      }
      // For stale, checkedAt is the frozen last-run timestamp; keep it so a
      // later stall at a new timestamp updates the issue.
      return stable({
        state,
        ok: parsed.ok ?? null,
        checkedAt: parsed.checkedAt ?? null,
        error: parsed.error ?? null
      });
    }
  } catch {
    // Fall back to trimmed body if unparseable.
  }
  return { state, raw: trimmed };
}

function buildAnchorsItem(runUrl) {
  const key = "anchors:stellar-docs";
  const fingerprint = sha256(stable({ key, kind: "capture-failed" }));
  const sections = [
    [
      "The public-site capture failed. Other service refresh checks continued.",
      "The committed anchor index stays in place.",
      "Headings without an indexed match use page URLs."
    ].join("\n"),
    [
      "Remediation: re-run `npm run docs:anchors:build` and review the captured heading changes.",
      "See the anchor capture step log for failed URLs."
    ].join("\n")
  ];
  const body = renderKeyedBody({
    key,
    fingerprint,
    heading: "Docs section anchor capture failed",
    runUrl,
    sections
  });
  return {
    key,
    driftClass: "anchors",
    source: "stellar-docs",
    title: "Drift (anchors): stellar-docs — section anchor capture failed",
    fingerprint,
    body,
    commentBody: body
  };
}

function buildCanaryItem(state, canaryOutput, runUrl) {
  const key = `canary:${state}`;
  const fingerprint = sha256(normalizeCanaryForFingerprint(state, canaryOutput));
  const snippet = String(canaryOutput ?? "").trim() || "(no verdict body)";
  if (state === "stale") {
    const body = renderKeyedBody({
      key,
      fingerprint,
      heading: "Skill-retrieval detector is STALE — current state unknown",
      runUrl,
      sections: [
        [
          "The hourly canary has not recorded a verdict in over 3 hours. This proves the",
          "DETECTOR stopped, and says nothing about whether retrieval works: the last",
          "verdict is simply too old to describe now. Do not read it either way."
        ].join("\n"),
        `\`\`\`json\n${snippet}\n\`\`\``,
        "Remediation: check the Worker's Cron Trigger and its Past Events in the Cloudflare dashboard, and `evt: \"skill_canary\"` in Workers Logs."
      ]
    });
    return {
      key,
      driftClass: "canary",
      source: "stale",
      title: "Drift (canary): stale — Worker skill-retrieval detector stale",
      fingerprint,
      body,
      commentBody: body
    };
  }
  const body = renderKeyedBody({
    key,
    fingerprint,
    heading: ":rotating_light: The deployed Worker cannot retrieve skills — LIVE OUTAGE",
    runUrl,
    sections: [
      [
        "This is the Worker's own verdict from inside Cloudflare, which is the only",
        "place a colo-egress failure is visible. The pin-availability step runs on",
        "a GitHub runner and can be green while this is red — that combination means the",
        "content is fine and OUR ACCESS to it is not."
      ].join("\n"),
      `\`\`\`json\n${snippet}\n\`\`\``,
      "Remediation: check Worker logs for `evt: \"skill_canary\"` and `skill_read` with ok=false, then Cloudflare status and GitHub status. Do not mirror the content to \"fix\" it — see `ARCHITECTURE.md` §6."
    ]
  });
  return {
    key,
    driftClass: "canary",
    source: "failing",
    title: "Drift (canary): failing — Worker skill retrieval live outage",
    fingerprint,
    body,
    commentBody: body
  };
}

function buildPinsItem(pinsOutput, runUrl) {
  const key = "pins:ecosystem-skills";
  const normalized = normalizePinOutput(pinsOutput);
  const fingerprint = sha256(stable({ key, output: normalized.canonical }));
  const body = renderKeyedBody({
    key,
    fingerprint,
    heading: ":rotating_light: Pinned skill file did not resolve upstream — LIVE `skill.read` OUTAGE",
    runUrl,
    sections: [
      [
        "Skill bodies are served from their pinned upstream, never stored. A pin that",
        "stops resolving means production `skill.read` is failing for real users right",
        "now on any cold read (warm colo caches and isolate memos may still succeed,",
        "so this can be a PARTIAL outage that looks healthy from one location)."
      ].join("\n"),
      `\`\`\`\n${normalized.display}\n\`\`\``,
      "Remediation: confirm the upstream repo/commit still exists and is public. If the content moved, re-pin (`ecosystem-skills/update.sh`), review the body diff, and DEPLOY — a merge alone does not reach production. See `ARCHITECTURE.md` §6 \"availability posture\". Do not solve this by mirroring the content."
    ]
  });
  return {
    key,
    driftClass: "pins",
    source: "ecosystem-skills",
    title: "Drift (pins): ecosystem-skills — pinned file unresolvable upstream",
    fingerprint,
    body,
    commentBody: body
  };
}

function buildGospelItem(gospelOutput, runUrl) {
  const key = "gospel:qa-corpus";
  const normalized = normalizeGospelOutput(gospelOutput);
  const fingerprint = sha256(stable({ key, output: normalized.canonical }));
  const body = renderKeyedBody({
    key,
    fingerprint,
    heading: "QA gospel past its re-verification date",
    runUrl,
    sections: [
      "The standing due-date queue fired. This is the truth-maintenance lane working as designed, not a script failure.",
      `\`\`\`\n${normalized.display}\n\`\`\``,
      "Remediation: triage each past-due case through the `golden-truth` lane — re-verify and set a new staggered `reverifyBy`, or record an explicit dated extension with a rootCause. Never silently bump a date."
    ]
  });
  return {
    key,
    driftClass: "gospel",
    source: "qa-corpus",
    title: "Drift (gospel): qa-corpus — QA gospel past re-verification date",
    fingerprint,
    body,
    commentBody: body
  };
}

function buildInventoryItem(inv, runUrl) {
  const key = `inventory:${inv.source}`;
  const fingerprint = sha256(
    stable({
      key,
      files: inv.files ?? [],
      classificationLines: inv.classificationLines ?? [],
      runnerHits: inv.runnerHits ?? [],
      contentHash: inv.contentHash ?? null
    })
  );

  const sections = [
    [
      "#### Resolution runbook",
      "",
      "Use `.agents/skills/live-drift-resolution/SKILL.md` to resolve this. The summary below is CI-derived evidence, not a verdict. Regenerate locally and classify from the actual diff before committing.",
      "",
      "Minimum checks before close: drift class, ADR-0003 exposure decision if needed, routing gate when routing text/keywords changed, runner live smoke if runner ops intersect, `npm run secrets:scan -- --tree`, independent review, and production deploy when approved."
    ].join("\n"),
    [
      "#### Files changed",
      "",
      inv.diffStat ? `\`\`\`\n${inv.diffStat}\n\`\`\`` : "_No file diffstat available._",
      ...(inv.files?.length ? ["", ...inv.files.map((file) => `- \`${file}\``)] : [])
    ].join("\n"),
    [
      "#### Classification hints",
      "",
      inv.classificationLines?.length
        ? inv.classificationLines.join("\n")
        : "- Inspect the file diff and workflow run logs."
    ].join("\n")
  ];

  if (inv.source === "lumenloop" || inv.source === "stellar-light" || (inv.runnerHits?.length ?? 0) > 0) {
    sections.push(
      [
        "#### Runner-affecting hints",
        "",
        inv.runnerHits?.length
          ? `${inv.runnerHits.join("\n")}\n\nRe-run the affected runnable skills live and verify projections before closing.`
          : "- No current runner declared ops intersect the CI-detected operation/tool changes."
      ].join("\n")
    );
  }

  const body = renderKeyedBody({
    key,
    fingerprint,
    heading: `Inventory drift: \`${inv.source}\``,
    runUrl,
    sections
  });

  return {
    key,
    driftClass: "inventory",
    source: inv.source,
    title: `Drift (inventory): ${inv.source}`,
    fingerprint,
    body,
    commentBody: body
  };
}

function buildSkillItem(entry, runUrl) {
  const isDirectory = DIRECTORY_SOURCE_IDS.has(entry.id);
  const driftClass = isDirectory ? "skills-directory" : "skills-pin";
  const key = `${driftClass}:${entry.id}`;
  const fingerprint = sha256(
    stable({
      key,
      pinned: entry.pinned ?? "",
      upstream: entry.upstream ?? "",
      note: entry.note ?? "",
      source: entry.source ?? null
    })
  );

  const details = [
    `- Source: \`${entry.id}\``,
    `- Pinned: \`${entry.pinned ?? "?"}\``,
    `- Upstream: \`${entry.upstream ?? "?"}\``
  ];
  if (entry.note) details.push(`- Detail: ${entry.note}`);

  const remediation = isDirectory
    ? [
        "Directory remediation: refresh the directory snapshots and index without moving pins. Review and commit.",
        "```sh",
        "node scripts/refresh-skill-directories.mjs",
        "```",
        "Never auto-sync from CI."
      ].join("\n")
    : [
        "Source remediation: run `ecosystem-skills/update.sh` locally. Review the skill diffs, record the attestation in `ecosystem-skills/PIN-REVIEW.md`, re-pin, and commit.",
        "Change picks in `ecosystem-skills/sources.json`. Record exclusions in `ecosystem-skills/groups.json`.",
        "Never auto-sync from CI."
      ].join("\n");

  const heading = isDirectory
    ? `Skill directory drift: \`${entry.id}\``
    : `Skill pin drift: \`${entry.id}\``;

  const body = renderKeyedBody({
    key,
    fingerprint,
    heading,
    runUrl,
    sections: [details.join("\n"), remediation]
  });

  return {
    key,
    driftClass,
    source: entry.id,
    title: `Drift (${driftClass}): ${entry.id}`,
    fingerprint,
    body,
    commentBody: body
  };
}

/**
 * Turn raw check states and outputs into a normalized per-key drift report.
 *
 * Strictly enforces the three-way/four-way enum contracts from refresh.yml:
 * an unexpected or missing output is always classified as a check error, never
 * coerced into clean or into a domain outage claim.
 */
export function buildDriftReport({
  runUrl = "",
  pinsState = "",
  pinsOutput = "",
  canaryState = "",
  canaryOutput = "",
  gospelState = "",
  gospelOutput = "",
  anchorsState = "",
  skillsDrift = "",
  skillsJson = null,
  inventoryItems = [],
  inventoryChecked = true,
  derivedChecked = true
}) {
  const pinsValid = pinsState === "clean" || pinsState === "unresolvable";
  const pinsError = !pinsValid;
  const normalizedPins = pinsValid ? pinsState : "error";

  const gospelValid = gospelState === "clean" || gospelState === "stale";
  const gospelError = !gospelValid;
  const normalizedGospel = gospelValid ? gospelState : "error";

  const canaryValid = canaryState === "clean" || canaryState === "failing" || canaryState === "stale";
  const canaryError = !canaryValid;
  const normalizedCanary = canaryValid ? canaryState : "error";

  const normalizedAnchors = anchorsState === "ok" ? "ok" : "error";

  // Validate skills drift enum and JSON payload together so a corrupted or
  // missing payload can never falsely close open skills issues.
  const skillsResults =
    skillsJson && typeof skillsJson === "object" && Array.isArray(skillsJson.results)
      ? skillsJson.results
      : null;

  let skillsError = skillsDrift !== "true" && skillsDrift !== "false";
  let skillsCheckOk = false;
  let skillsErroredSources = [];
  let skillsSkippedSources = [];
  let skillsDriftedEntries = [];

  if (skillsResults) {
    const hasInvalidEntry = skillsResults.some(
      (r) =>
        !r ||
        typeof r !== "object" ||
        typeof r.id !== "string" ||
        r.id.length === 0 ||
        !VALID_SKILL_STATUSES.has(r.status)
    );
    if (hasInvalidEntry) {
      skillsError = true;
    } else {
      const drifted = skillsResults.filter((r) => r.status === "DRIFT");
      const errored = skillsResults.filter((r) => r.status === "error");
      const skipped = skillsResults.filter((r) => r.status === "skipped");

      if (skillsDrift === "false") {
        if (drifted.length === 0 && errored.length === 0) {
          skillsCheckOk = true;
          skillsSkippedSources = skipped.map((r) => r.id).sort();
        } else {
          skillsError = true;
        }
      } else if (skillsDrift === "true") {
        if (drifted.length > 0 && errored.length === 0) {
          skillsCheckOk = true;
          skillsDriftedEntries = drifted;
          skillsSkippedSources = skipped.map((r) => r.id).sort();
        } else {
          skillsError = true;
        }
      } else if (skillsDrift === "error" && errored.length > 0) {
        // Partial check error: check-skills-drift exited 2 because one or more
        // sources errored, while still producing a complete JSON results array.
        // Preserve real DRIFT items and clean-source closes while protecting
        // errored and skipped sources from closure.
        skillsError = true;
        skillsCheckOk = true;
        skillsDriftedEntries = drifted;
        skillsErroredSources = errored.map((r) => r.id).sort();
        skillsSkippedSources = skipped.map((r) => r.id).sort();
      }
    }
  } else {
    skillsError = true;
  }

  const items = [];
  if (normalizedAnchors === "error") {
    items.push(buildAnchorsItem(runUrl));
  }
  if (normalizedCanary === "stale" || normalizedCanary === "failing") {
    items.push(buildCanaryItem(normalizedCanary, canaryOutput, runUrl));
  }
  if (normalizedPins === "unresolvable") {
    items.push(buildPinsItem(pinsOutput, runUrl));
  }
  if (normalizedGospel === "stale") {
    items.push(buildGospelItem(gospelOutput, runUrl));
  }
  if (inventoryChecked) {
    for (const inv of inventoryItems) {
      items.push(buildInventoryItem(inv, runUrl));
    }
  }
  for (const entry of skillsDriftedEntries) {
    items.push(buildSkillItem(entry, runUrl));
  }

  items.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

  return {
    runUrl,
    drift: items.length > 0,
    errors: {
      pins: pinsError,
      canary: canaryError,
      gospel: gospelError,
      skills: skillsError
    },
    checks: {
      anchors: normalizedAnchors,
      canary: normalizedCanary,
      pins: normalizedPins,
      gospel: normalizedGospel,
      inventory: inventoryChecked ? "checked" : "error",
      derived: derivedChecked ? "checked" : "skipped",
      skills: {
        ok: skillsCheckOk,
        erroredSources: skillsErroredSources,
        skippedSources: skillsSkippedSources
      }
    },
    items
  };
}

/**
 * Decide whether an open keyed issue whose key is absent from `report.items`
 * is proven clean and safe to close. Fails closed on any check error or
 * unrecognized drift class.
 */
export function canCloseKey(key, checks) {
  const parsed = parseDriftKey(key);
  if (!parsed || !checks) return { ok: false, reason: "invalid drift key or missing check state" };
  const { driftClass, source } = parsed;

  switch (driftClass) {
    case "anchors":
      return checks.anchors === "ok"
        ? { ok: true }
        : { ok: false, reason: `anchors check state is ${checks.anchors}` };
    case "canary":
      if (checks.canary === "error") return { ok: false, reason: "canary check errored" };
      if (source === "stale") {
        // Any fresh verdict (clean or failing) proves the detector is running again.
        return checks.canary === "clean" || checks.canary === "failing"
          ? { ok: true }
          : { ok: false, reason: `canary check state is ${checks.canary}` };
      }
      // A stale detector says nothing about whether retrieval recovered, so
      // canary:failing can only close on a fresh clean verdict.
      return checks.canary === "clean"
        ? { ok: true }
        : { ok: false, reason: `canary state is ${checks.canary}; retrieval recovery is unverified` };
    case "pins":
      return checks.pins === "clean"
        ? { ok: true }
        : { ok: false, reason: `pins check state is ${checks.pins}` };
    case "gospel":
      return checks.gospel === "clean"
        ? { ok: true }
        : { ok: false, reason: `gospel check state is ${checks.gospel}` };
    case "inventory":
      if (checks.inventory !== "checked") {
        return { ok: false, reason: `inventory check state is ${checks.inventory}` };
      }
      if (source === "stellar-docs-anchors" && checks.anchors !== "ok") {
        return { ok: false, reason: "anchor capture failed, so stellar-docs-anchors was not refreshed" };
      }
      if (source === "derived" && checks.derived === "skipped") {
        return { ok: false, reason: "derived catalog/spec builders were skipped" };
      }
      return { ok: true };
    case "skills-pin":
    case "skills-directory":
      if (!checks.skills?.ok) {
        return { ok: false, reason: "skills drift check errored" };
      }
      if ((checks.skills.erroredSources ?? []).includes(source)) {
        return { ok: false, reason: `skills source ${source} errored` };
      }
      if ((checks.skills.skippedSources ?? []).includes(source)) {
        return { ok: false, reason: `skills source ${source} was skipped` };
      }
      return { ok: true };
    default:
      return { ok: false, reason: `unrecognized drift class "${driftClass}"` };
  }
}

function normalizeAssignees(assignees) {
  if (!Array.isArray(assignees)) return [];
  return assignees
    .map((entry) => (typeof entry === "string" ? entry : entry?.login))
    .filter((login) => typeof login === "string" && login.length > 0);
}

function hasAssignee(assignees, expected) {
  if (!expected) return true;
  const needle = expected.toLowerCase();
  return normalizeAssignees(assignees).some((login) => login.toLowerCase() === needle);
}

export function lastRecordedFingerprint(issue, key) {
  const comments = Array.isArray(issue.comments) ? issue.comments : [];
  for (let i = comments.length - 1; i >= 0; i--) {
    const parsed = parseDriftMarker(comments[i]?.body ?? "");
    if (parsed && parsed.key === key && parsed.fingerprint) {
      return parsed.fingerprint;
    }
  }
  const bodyMarker = parseDriftMarker(issue.body ?? "");
  if (bodyMarker && bodyMarker.key === key && bodyMarker.fingerprint) {
    return bodyMarker.fingerprint;
  }
  return null;
}

export function buildClearingComment(key, runUrl) {
  const runClause = runUrl ? ` in ${runUrl}` : "";
  return `Drift for \`${key}\` cleared${runClause}. Closing.\n`;
}

/**
 * Pure reconciliation planner: given a drift report and the currently open
 * `drift`-labeled issues, compute the exact open / update / unchanged / close /
 * hold-on-error / ignore-legacy actions.
 */
export function planDriftIssueSync({ report, openIssues = [], assignee = "" }) {
  const targetAssignee = typeof assignee === "string" && assignee.trim() ? assignee.trim() : null;
  const actions = [];
  const warnings = [];
  const byKey = new Map();

  for (const issue of openIssues) {
    const marker = parseDriftMarker(issue.body ?? "");
    if (!marker) {
      actions.push({
        type: "ignore-legacy",
        number: issue.number,
        title: issue.title ?? ""
      });
      continue;
    }
    const bucket = byKey.get(marker.key) ?? [];
    bucket.push(issue);
    byKey.set(marker.key, bucket);
  }

  for (const bucket of byKey.values()) {
    bucket.sort((a, b) => a.number - b.number);
  }

  const currentItems = [...(report.items ?? [])].sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  const currentKeys = new Set(currentItems.map((item) => item.key));

  for (const item of currentItems) {
    const matches = byKey.get(item.key);
    if (!matches || matches.length === 0) {
      actions.push({
        type: "open",
        key: item.key,
        title: item.title,
        body: item.body,
        fingerprint: item.fingerprint,
        assignee: targetAssignee
      });
      continue;
    }

    const canonical = matches[0];
    if (matches.length > 1) {
      const extras = matches.slice(1).map((i) => `#${i.number}`).join(", ");
      warnings.push(`multiple open drift issues for key ${item.key} (using #${canonical.number}; duplicates: ${extras})`);
    }

    const addAssignee = targetAssignee && !hasAssignee(canonical.assignees, targetAssignee) ? targetAssignee : null;
    const previousFingerprint = lastRecordedFingerprint(canonical, item.key);
    if (previousFingerprint !== item.fingerprint) {
      actions.push({
        type: "update",
        key: item.key,
        number: canonical.number,
        title: canonical.title ?? item.title,
        body: item.commentBody ?? item.body,
        fingerprint: item.fingerprint,
        previousFingerprint,
        addAssignee
      });
    } else {
      actions.push({
        type: "unchanged",
        key: item.key,
        number: canonical.number,
        title: canonical.title ?? item.title,
        fingerprint: item.fingerprint,
        addAssignee
      });
    }
  }

  const sortedOpenKeys = [...byKey.keys()].sort();
  for (const key of sortedOpenKeys) {
    if (currentKeys.has(key)) continue;
    const closeDecision = canCloseKey(key, report.checks);
    for (const issue of byKey.get(key)) {
      if (closeDecision.ok) {
        actions.push({
          type: "close",
          key,
          number: issue.number,
          title: issue.title ?? "",
          comment: buildClearingComment(key, report.runUrl)
        });
      } else {
        actions.push({
          type: "hold-on-error",
          key,
          number: issue.number,
          title: issue.title ?? "",
          reason: closeDecision.reason
        });
      }
    }
  }

  return { actions, warnings };
}

// ---------------------------------------------------------------------------
// GitHub CLI adapter
// ---------------------------------------------------------------------------
function gh(args, { input } = {}) {
  return execFileSync("gh", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    input,
    stdio: [input !== undefined ? "pipe" : "ignore", "pipe", "pipe"]
  });
}

function resolveRepo(repoFlag) {
  if (repoFlag) return repoFlag;
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  return gh(["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]).trim();
}

function ghApiPaginateArray(endpointBase) {
  const items = [];
  const sep = endpointBase.includes("?") ? "&" : "?";
  for (let page = 1; page <= 100; page++) {
    const raw = gh(["api", `${endpointBase}${sep}per_page=100&page=${page}`]);
    const batch = JSON.parse(raw);
    if (!Array.isArray(batch)) {
      throw new Error(`expected array from ${endpointBase} (page ${page})`);
    }
    items.push(...batch);
    if (batch.length < 100) return items;
  }
  throw new Error(`pagination limit (100 pages) exceeded for ${endpointBase}`);
}

function fetchOpenDriftIssues(repo, currentKeys) {
  const issues = ghApiPaginateArray(
    `repos/${repo}/issues?state=open&labels=${encodeURIComponent(DRIFT_LABEL)}`
  ).filter((issue) => issue && !issue.pull_request);

  // Only fetch comments for open keyed issues whose key is currently drifting;
  // legacy, closing, and held issues do not need comment history.
  const enriched = [];
  for (const issue of issues) {
    const marker = parseDriftMarker(issue.body ?? "");
    let comments = [];
    if (marker && currentKeys.has(marker.key) && (issue.comments ?? 0) > 0) {
      comments = ghApiPaginateArray(`repos/${repo}/issues/${issue.number}/comments`);
    }
    enriched.push({
      number: issue.number,
      title: issue.title,
      body: issue.body ?? "",
      assignees: normalizeAssignees(issue.assignees),
      comments: comments.map((c) => ({ body: c?.body ?? "" }))
    });
  }
  return enriched;
}

function ensureDriftLabel(repo) {
  try {
    gh([
      "label",
      "create",
      DRIFT_LABEL,
      "--repo",
      repo,
      "--description",
      DRIFT_LABEL_DESCRIPTION,
      "--color",
      DRIFT_LABEL_COLOR
    ]);
  } catch {
    // Label already exists (or cannot be recreated); issue creation will surface
    // any real permissions error.
  }
}

function tryAddAssignee(repo, target, assignee) {
  try {
    gh(["issue", "edit", String(target), "--repo", repo, "--add-assignee", assignee]);
  } catch (err) {
    const detail = err?.stderr?.trim() || err?.message || String(err);
    console.log(`::warning::Could not assign ${assignee} to drift issue ${target}: ${detail}`);
  }
}

function executePlan(plan, repo) {
  if (plan.actions.some((action) => action.type === "open")) {
    ensureDriftLabel(repo);
  }
  for (const warning of plan.warnings) {
    console.log(`::warning::${warning}`);
  }
  const failures = [];
  for (const action of plan.actions) {
    try {
      switch (action.type) {
        case "open": {
          const created = gh(
            ["issue", "create", "--repo", repo, "--title", action.title, "--label", DRIFT_LABEL, "--body-file", "-"],
            { input: action.body }
          ).trim();
          console.log(`open ${action.key}: created ${created}`);
          if (action.assignee) tryAddAssignee(repo, created, action.assignee);
          break;
        }
        case "update": {
          if (action.addAssignee) tryAddAssignee(repo, action.number, action.addAssignee);
          gh(["issue", "comment", String(action.number), "--repo", repo, "--body-file", "-"], {
            input: action.body
          });
          console.log(`update ${action.key}: commented on #${action.number} (fingerprint changed)`);
          break;
        }
        case "unchanged": {
          if (action.addAssignee) tryAddAssignee(repo, action.number, action.addAssignee);
          console.log(`unchanged ${action.key}: #${action.number} left without comment`);
          break;
        }
        case "close": {
          gh(["issue", "comment", String(action.number), "--repo", repo, "--body-file", "-"], {
            input: action.comment
          });
          gh(["issue", "close", String(action.number), "--repo", repo, "--reason", "completed"]);
          console.log(`close ${action.key}: commented and closed #${action.number}`);
          break;
        }
        case "hold-on-error":
          console.log(`hold ${action.key}: #${action.number} left open (${action.reason})`);
          break;
        case "ignore-legacy":
          console.log(`ignore legacy: #${action.number} (${action.title}) has no drift key marker`);
          break;
      }
    } catch (err) {
      const detail = err?.stderr?.trim() || err?.message || String(err);
      const target = action.key ?? `#${action.number}`;
      console.error(`::error::drift issue sync failed for ${action.type} ${target}: ${detail}`);
      failures.push(`${action.type} ${target}: ${detail}`);
    }
  }
  if (failures.length > 0) {
    throw new Error(`${failures.length} drift issue action(s) failed:\n- ${failures.join("\n- ")}`);
  }
}

function printPlanSummary(plan, { dryRun, json }) {
  if (json) {
    console.log(JSON.stringify({ dryRun, ...plan }, null, 2));
    return;
  }
  const prefix = dryRun ? "[dry-run] " : "";
  for (const warning of plan.warnings) {
    console.log(`${prefix}warning: ${warning}`);
  }
  if (plan.actions.length === 0) {
    console.log(`${prefix}no drift issue actions planned.`);
    return;
  }
  for (const action of plan.actions) {
    switch (action.type) {
      case "open":
        console.log(
          `${prefix}open       ${action.key} -> "${action.title}"` +
            `${action.assignee ? ` (assign ${action.assignee})` : ""} [${action.fingerprint.slice(0, 12)}]`
        );
        break;
      case "update":
        console.log(
          `${prefix}update     ${action.key} -> comment #${action.number} ` +
            `(${action.previousFingerprint ? action.previousFingerprint.slice(0, 12) : "none"} -> ${action.fingerprint.slice(0, 12)})` +
            `${action.addAssignee ? ` + assign ${action.addAssignee}` : ""}`
        );
        break;
      case "unchanged":
        console.log(
          `${prefix}unchanged  ${action.key} -> #${action.number} [${action.fingerprint.slice(0, 12)}]` +
            `${action.addAssignee ? ` (assign ${action.addAssignee})` : ""}`
        );
        break;
      case "close":
        console.log(`${prefix}close      ${action.key} -> comment + close #${action.number}`);
        break;
      case "hold-on-error":
        console.log(`${prefix}hold       ${action.key} -> keep #${action.number} open (${action.reason})`);
        break;
      case "ignore-legacy":
        console.log(`${prefix}ignore     #${action.number} "${action.title}" (unkeyed legacy drift issue)`);
        break;
    }
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
export function parseFlags(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) throw new Error(`unexpected argument: ${arg}`);
    const name = arg.slice(2);
    if (name === "dry-run" || name === "json") {
      flags[name] = true;
      continue;
    }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      throw new Error(`missing value for --${name}`);
    }
    flags[name] = next;
    i++;
  }
  return flags;
}

function readOptionalFile(path) {
  if (!path || !existsSync(path)) return "";
  return readFileSync(path, "utf8");
}

function readOptionalJson(path) {
  const raw = readOptionalFile(path).trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function runCollect(argv) {
  const flags = parseFlags(argv);
  const inventoryItems = flags["inventory-file"]
    ? JSON.parse(readFileSync(flags["inventory-file"], "utf8"))
    : collectInventoryDrift();

  const report = buildDriftReport({
    runUrl: flags["run-url"] ?? "",
    pinsState: flags["pins-state"] ?? "",
    pinsOutput: readOptionalFile(flags["pins-file"]),
    canaryState: flags["canary-state"] ?? "",
    canaryOutput: readOptionalFile(flags["canary-file"]),
    gospelState: flags["gospel-state"] ?? "",
    gospelOutput: readOptionalFile(flags["gospel-file"]),
    anchorsState: flags["anchors-state"] ?? "",
    skillsDrift: flags["skills-drift"] ?? "",
    skillsJson: readOptionalJson(flags["skills-file"]),
    inventoryItems,
    inventoryChecked: true,
    derivedChecked: flags["derived-checked"] !== "false"
  });

  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (!flags.out || flags.out === "-") {
    process.stdout.write(serialized);
  } else {
    writeFileSync(flags.out, serialized);
  }

  if (flags["github-output"]) {
    const outputs = [
      `skills_error=${report.errors.skills}`,
      `pins_error=${report.errors.pins}`,
      `gospel_error=${report.errors.gospel}`,
      `canary_error=${report.errors.canary}`,
      `drift=${report.drift}`
    ].join("\n");
    appendFileSync(flags["github-output"], `${outputs}\n`);
  }
}

function runSync(argv) {
  const flags = parseFlags(argv);
  if (!flags.report) throw new Error("sync requires --report <drift-report.json>");
  const report = JSON.parse(readFileSync(flags.report, "utf8"));
  const dryRun = Boolean(flags["dry-run"]);
  const json = Boolean(flags.json);
  const assignee = flags.assignee ?? process.env.REFRESH_ISSUE_ASSIGNEE ?? "";

  let openIssues;
  let repo = flags.repo ?? "";
  if (flags["open-issues"]) {
    if (!dryRun) {
      throw new Error("--open-issues is only permitted with --dry-run");
    }
    openIssues = JSON.parse(readFileSync(flags["open-issues"], "utf8"));
  } else {
    repo = resolveRepo(flags.repo);
    const currentKeys = new Set((report.items ?? []).map((item) => item.key));
    openIssues = fetchOpenDriftIssues(repo, currentKeys);
  }

  const plan = planDriftIssueSync({ report, openIssues, assignee });
  if (dryRun) {
    printPlanSummary(plan, { dryRun: true, json });
    return;
  }

  if (!repo) repo = resolveRepo(flags.repo);
  executePlan(plan, repo);
  if (json) printPlanSummary(plan, { dryRun: false, json: true });
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (command === "collect") {
    runCollect(rest);
  } else if (command === "sync") {
    runSync(rest);
  } else {
    console.error("usage: sync-drift-issues.mjs <collect|sync> [options]");
    process.exit(2);
  }
}

function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  }
}

if (isMainModule()) {
  try {
    main();
  } catch (err) {
    console.error(`sync-drift-issues failed: ${err?.message ?? err}`);
    process.exit(2);
  }
}
