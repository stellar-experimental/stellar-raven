import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildDriftReport,
  canCloseKey,
  formatMarker,
  parseDriftMarker,
  parseFlags,
  planDriftIssueSync
} from "../scripts/sync-drift-issues.mjs";

const REPO = resolve(import.meta.dirname, "..");
const tempDirs = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function cleanInputs(overrides = {}) {
  return {
    runUrl: "https://github.com/stellar-experimental/stellar-raven/actions/runs/100",
    pinsState: "clean",
    pinsOutput: "",
    canaryState: "clean",
    canaryOutput: JSON.stringify({ ok: true, checkedAt: "2026-11-19T06:00:00Z", checked: 20, ms: 500, error: null }),
    gospelState: "clean",
    gospelOutput: "",
    anchorsState: "ok",
    skillsDrift: "false",
    skillsJson: {
      checkedAt: "2026-11-19T06:17:00Z",
      drift: false,
      results: [
        { id: "stellar-dev", status: "ok", pinned: "aaa111", upstream: "aaa111" },
        { id: "stellar-community-catalog", status: "ok", pinned: "52 entries", upstream: "52 entries" },
        { id: "stellarlight-catalog", status: "ok", pinned: "84 entries", upstream: "84 entries" }
      ]
    },
    inventoryItems: [],
    inventoryChecked: true,
    ...overrides
  };
}

function makeInventoryItem(source, overrides = {}) {
  return {
    source,
    files: [`inventory/${source}.json`],
    diffStat: `inventory/${source}.json | 4 ++--`,
    classificationLines: [`- inventory/${source}.json: changed`],
    runnerHits: [],
    contentHash: `hash-${source}-v1`,
    ...overrides
  };
}

describe("drift key routing (buildDriftReport)", () => {
  it("routes every drift class and source to its own stable key with embedded marker", () => {
    const report = buildDriftReport(
      cleanInputs({
        anchorsState: "error",
        canaryState: "failing",
        canaryOutput: JSON.stringify({ ok: false, checkedAt: "2026-11-19T06:00:00Z", checked: 5, ms: 420, error: "unreachable" }),
        pinsState: "unresolvable",
        pinsOutput: "mirror checks failed:\n- ecosystem-skills pin unusable: stellar-dev/dapp/SKILL.md — HTTP 404",
        gospelState: "stale",
        gospelOutput: "[stale] q-example: truth.reverifyBy 2026-11-18 is past due (today 2026-11-19)",
        skillsDrift: "true",
        skillsJson: {
          checkedAt: "2026-11-19T06:17:00Z",
          drift: true,
          results: [
            { id: "stellar-dev", status: "DRIFT", pinned: "aaa111", upstream: "bbb222", note: "pinned -> upstream" },
            { id: "stellar-community-catalog", status: "DRIFT", pinned: "51 entries", upstream: "52 entries", note: "added: x" },
            { id: "stellarlight-catalog", status: "ok", pinned: "84 entries", upstream: "84 entries" }
          ]
        },
        inventoryItems: [
          makeInventoryItem("lumenloop"),
          makeInventoryItem("stellar-light"),
          makeInventoryItem("stellar-docs-titles")
        ]
      })
    );

    expect(report.drift).toBe(true);
    expect(report.errors).toEqual({ pins: false, canary: false, gospel: false, skills: false });
    expect(report.items.map((i) => i.key)).toEqual([
      "anchors:stellar-docs",
      "canary:failing",
      "gospel:qa-corpus",
      "inventory:lumenloop",
      "inventory:stellar-docs-titles",
      "inventory:stellar-light",
      "pins:ecosystem-skills",
      "skills-directory:stellar-community-catalog",
      "skills-pin:stellar-dev"
    ]);

    for (const item of report.items) {
      const marker = parseDriftMarker(item.body);
      expect(marker).toEqual({ key: item.key, fingerprint: item.fingerprint });
      expect(item.title).toContain(item.driftClass);
      expect(item.title).toContain(item.source);
    }
  });

  it("keeps fingerprints stable across volatile run fields while detecting real changes", () => {
    const day1 = buildDriftReport(
      cleanInputs({
        runUrl: "https://github.com/org/repo/actions/runs/1",
        canaryState: "failing",
        canaryOutput: JSON.stringify({ ok: false, checkedAt: "2026-11-19T06:00:00Z", checked: 3, ms: 200, error: "unreachable" }),
        gospelState: "stale",
        gospelOutput: "[stale] q-a: truth.reverifyBy 2026-11-18 is past due (today 2026-11-19)",
        pinsState: "unresolvable",
        pinsOutput: "mirror checks failed:\n- pin b\n- pin a"
      })
    );
    const day2Same = buildDriftReport(
      cleanInputs({
        runUrl: "https://github.com/org/repo/actions/runs/2",
        canaryState: "failing",
        canaryOutput: JSON.stringify({ ok: false, checkedAt: "2026-11-20T06:00:00Z", checked: 3, ms: 850, error: "unreachable" }),
        gospelState: "stale",
        gospelOutput: "[stale] q-a: truth.reverifyBy 2026-11-18 is past due (today 2026-11-20)",
        pinsState: "unresolvable",
        pinsOutput: "mirror checks failed:\n- pin a\n- pin b"
      })
    );
    const day3Changed = buildDriftReport(
      cleanInputs({
        runUrl: "https://github.com/org/repo/actions/runs/3",
        canaryState: "failing",
        canaryOutput: JSON.stringify({ ok: false, checkedAt: "2026-11-21T06:00:00Z", checked: 3, ms: 200, error: "integrity" }),
        gospelState: "stale",
        gospelOutput: "[stale] q-a: truth.reverifyBy 2026-11-18 is past due (today 2026-11-21)\n[stale] q-b: truth.reverifyBy 2026-11-20 is past due (today 2026-11-21)",
        pinsState: "unresolvable",
        pinsOutput: "mirror checks failed:\n- pin a\n- pin b\n- pin c"
      })
    );

    const fpByKey = (r) => Object.fromEntries(r.items.map((i) => [i.key, i.fingerprint]));
    expect(fpByKey(day2Same)).toEqual(fpByKey(day1));
    for (const key of Object.keys(fpByKey(day1))) {
      expect(fpByKey(day3Changed)[key]).not.toBe(fpByKey(day1)[key]);
    }
  });

  it("handles partial skills check error without losing real drift or closing errored sources", () => {
    const report = buildDriftReport(
      cleanInputs({
        skillsDrift: "error",
        skillsJson: {
          results: [
            { id: "stellar-dev", status: "error", pinned: "?", upstream: "?", note: "HTTP 502" },
            { id: "stellar-community-catalog", status: "DRIFT", pinned: "51", upstream: "52", note: "added: y" },
            { id: "stellarlight-catalog", status: "ok", pinned: "84", upstream: "84" }
          ]
        }
      })
    );

    expect(report.errors.skills).toBe(true);
    expect(report.drift).toBe(true);
    expect(report.items.map((i) => i.key)).toEqual(["skills-directory:stellar-community-catalog"]);
    expect(canCloseKey("skills-pin:stellar-dev", report.checks).ok).toBe(false);
    expect(canCloseKey("skills-directory:stellarlight-catalog", report.checks).ok).toBe(true);
  });

  it("fails closed when step outputs, skills JSON, or skill statuses are invalid", () => {
    const report = buildDriftReport(
      cleanInputs({
        pinsState: "",
        canaryState: "unexpected",
        gospelState: "error",
        skillsDrift: "false",
        skillsJson: null
      })
    );

    expect(report.errors).toEqual({ pins: true, canary: true, gospel: true, skills: true });
    expect(report.drift).toBe(false);
    expect(canCloseKey("pins:ecosystem-skills", report.checks).ok).toBe(false);
    expect(canCloseKey("canary:failing", report.checks).ok).toBe(false);
    expect(canCloseKey("gospel:qa-corpus", report.checks).ok).toBe(false);
    expect(canCloseKey("skills-pin:stellar-dev", report.checks).ok).toBe(false);

    const unknownStatus = buildDriftReport(
      cleanInputs({
        skillsDrift: "false",
        skillsJson: { results: [{ id: "stellar-dev", status: "unknown" }] },
        derivedChecked: false
      })
    );
    expect(unknownStatus.errors.skills).toBe(true);
    expect(canCloseKey("skills-pin:stellar-dev", unknownStatus.checks).ok).toBe(false);
    expect(canCloseKey("inventory:derived", unknownStatus.checks).ok).toBe(false);
  });
});

describe("issue reconciliation planning (planDriftIssueSync)", () => {
  it("plans open, update, unchanged, close, hold-on-error, and ignore-legacy in one pass", () => {
    const report = buildDriftReport(
      cleanInputs({
        runUrl: "https://github.com/org/repo/actions/runs/555",
        anchorsState: "error",
        canaryState: "error",
        skillsDrift: "true",
        skillsJson: {
          results: [
            { id: "stellar-dev", status: "DRIFT", pinned: "aaa", upstream: "bbb", note: "new commit" },
            { id: "stellar-community-catalog", status: "DRIFT", pinned: "51", upstream: "52", note: "added: z" },
            { id: "stellarlight-catalog", status: "ok", pinned: "84", upstream: "84" }
          ]
        },
        inventoryItems: [makeInventoryItem("stellar-light")]
      })
    );

    const byKey = Object.fromEntries(report.items.map((i) => [i.key, i]));
    const openIssues = [
      // Legacy unkeyed issue: must be left untouched.
      { number: 223, title: "Live service drift detected", body: "legacy body", assignees: ["kalepail"], comments: [] },
      // Same fingerprint as latest marker comment (plus a later human comment): unchanged!
      {
        number: 601,
        title: "Drift (inventory): stellar-light",
        body: `${formatMarker("inventory:stellar-light", "0".repeat(64))}\nold body`,
        assignees: ["kalepail"],
        comments: [
          { body: `${formatMarker("inventory:stellar-light", byKey["inventory:stellar-light"].fingerprint)}\nupdated` },
          { body: "Human note: reviewing tomorrow." }
        ]
      },
      // Different fingerprint: update comment required + missing assignee added!
      {
        number: 602,
        title: "Drift (skills-pin): stellar-dev",
        body: `${formatMarker("skills-pin:stellar-dev", "1".repeat(64))}\nold commit`,
        assignees: [],
        comments: []
      },
      // Cleared key whose check succeeded cleanly: close with run URL!
      {
        number: 603,
        title: "Drift (skills-directory): stellarlight-catalog",
        body: `${formatMarker("skills-directory:stellarlight-catalog", "2".repeat(64))}\nold`,
        assignees: ["kalepail"],
        comments: []
      },
      // Absent key whose owning check errored (canary_error): must hold open!
      {
        number: 604,
        title: "Drift (canary): failing",
        body: `${formatMarker("canary:failing", "3".repeat(64))}\nold`,
        assignees: ["kalepail"],
        comments: []
      },
      // Absent inventory:stellar-docs-anchors while anchors capture failed: must hold open!
      {
        number: 605,
        title: "Drift (inventory): stellar-docs-anchors",
        body: `${formatMarker("inventory:stellar-docs-anchors", "4".repeat(64))}\nold`,
        assignees: ["kalepail"],
        comments: []
      }
    ];

    const plan = planDriftIssueSync({ report, openIssues, assignee: "kalepail" });
    const summary = plan.actions.map((a) => ({
      type: a.type,
      key: a.key ?? null,
      number: a.number ?? null,
      assignee: a.assignee ?? a.addAssignee ?? null
    }));

    expect(summary).toEqual([
      { type: "ignore-legacy", key: null, number: 223, assignee: null },
      { type: "open", key: "anchors:stellar-docs", number: null, assignee: "kalepail" },
      { type: "unchanged", key: "inventory:stellar-light", number: 601, assignee: null },
      { type: "open", key: "skills-directory:stellar-community-catalog", number: null, assignee: "kalepail" },
      { type: "update", key: "skills-pin:stellar-dev", number: 602, assignee: "kalepail" },
      { type: "hold-on-error", key: "canary:failing", number: 604, assignee: null },
      { type: "hold-on-error", key: "inventory:stellar-docs-anchors", number: 605, assignee: null },
      { type: "close", key: "skills-directory:stellarlight-catalog", number: 603, assignee: null }
    ]);

    const closeAction = plan.actions.find((a) => a.type === "close");
    expect(closeAction.comment).toContain("https://github.com/org/repo/actions/runs/555");
  });

  it("closes stale canary on failing verdict, but holds failing canary when detector goes stale", () => {
    const toFailing = buildDriftReport(
      cleanInputs({
        canaryState: "failing",
        canaryOutput: JSON.stringify({ ok: false, checkedAt: "2026-11-19T06:00:00Z", checked: 1, ms: 50, error: "unreachable" })
      })
    );
    const staleOpen = [
      {
        number: 700,
        title: "Drift (canary): stale",
        body: `${formatMarker("canary:stale", "a".repeat(64))}\nold`,
        assignees: ["kalepail"],
        comments: []
      }
    ];
    expect(planDriftIssueSync({ report: toFailing, openIssues: staleOpen, assignee: "kalepail" }).actions.map((a) => [a.type, a.key, a.number ?? null])).toEqual([
      ["open", "canary:failing", null],
      ["close", "canary:stale", 700]
    ]);

    const toStale = buildDriftReport(
      cleanInputs({
        canaryState: "stale",
        canaryOutput: JSON.stringify({ ok: false, checkedAt: "2026-11-19T02:00:00Z", checked: 1, ms: 50, error: "unreachable" })
      })
    );
    const failingOpen = [
      {
        number: 701,
        title: "Drift (canary): failing",
        body: `${formatMarker("canary:failing", "b".repeat(64))}\nold`,
        assignees: ["kalepail"],
        comments: []
      }
    ];
    expect(planDriftIssueSync({ report: toStale, openIssues: failingOpen, assignee: "kalepail" }).actions.map((a) => [a.type, a.key, a.number ?? null])).toEqual([
      ["open", "canary:stale", null],
      ["hold-on-error", "canary:failing", 701]
    ]);
  });

  it("ignores markers quoted outside line 1 so legacy issues with examples stay untouched", () => {
    const quotedLegacy = `Discussion of drift keys:\n\`\`\`html\n${formatMarker("inventory:stellar-light", "c".repeat(64))}\n\`\`\``;
    expect(parseDriftMarker(quotedLegacy)).toBeNull();
    const plan = planDriftIssueSync({
      report: buildDriftReport(cleanInputs()),
      openIssues: [{ number: 800, title: "Drift discussion", body: quotedLegacy, assignees: [], comments: [] }],
      assignee: "kalepail"
    });
    expect(plan.actions.map((a) => [a.type, a.number])).toEqual([["ignore-legacy", 800]]);
  });

  it("rejects missing flag values and refuses --open-issues without --dry-run", () => {
    expect(() => parseFlags(["--assignee", "--dry-run"])).toThrow(/missing value for --assignee/);
    const dir = mkdtempSync(join(tmpdir(), "sync-drift-guard-"));
    tempDirs.push(dir);
    const reportPath = join(dir, "report.json");
    const openPath = join(dir, "open.json");
    writeFileSync(reportPath, JSON.stringify(buildDriftReport(cleanInputs())));
    writeFileSync(openPath, "[]");
    expect(() =>
      execFileSync(
        process.execPath,
        [join(REPO, "scripts", "sync-drift-issues.mjs"), "sync", "--report", reportPath, "--open-issues", openPath],
        { encoding: "utf8", stdio: "pipe" }
      )
    ).toThrow(/--open-issues is only permitted with --dry-run/);
  });

  it("supports offline dry-run CLI against fixture report and open-issues JSON", () => {
    const dir = mkdtempSync(join(tmpdir(), "sync-drift-cli-"));
    tempDirs.push(dir);
    const reportPath = join(dir, "report.json");
    const openPath = join(dir, "open.json");
    const report = buildDriftReport(cleanInputs({ inventoryItems: [makeInventoryItem("lumenloop")] }));
    writeFileSync(reportPath, JSON.stringify(report));
    writeFileSync(
      openPath,
      JSON.stringify([
        { number: 90, title: "Drift (inventory): stellar-org", body: formatMarker("inventory:stellar-org", "b".repeat(64)), assignees: [], comments: [] }
      ])
    );

    const out = execFileSync(
      process.execPath,
      [join(REPO, "scripts", "sync-drift-issues.mjs"), "sync", "--report", reportPath, "--open-issues", openPath, "--assignee", "kalepail", "--dry-run", "--json"],
      { encoding: "utf8" }
    );
    const parsed = JSON.parse(out);
    expect(parsed.dryRun).toBe(true);
    expect(parsed.actions.map((a) => [a.type, a.key])).toEqual([
      ["open", "inventory:lumenloop"],
      ["close", "inventory:stellar-org"]
    ]);
  });
});
