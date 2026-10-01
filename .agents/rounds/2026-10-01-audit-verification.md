# Audit verification — 2026-10-01

## Scope

Confirm that the 2026-09-30 repository audit ([ledger](2026-09-30-repo-audit.md)) satisfied the
owner's original prompt. Re-run each prompt bullet as a fresh read-only audit of `main` `e1307b45`,
fix what remains, and finish the audit's deferred work.

Already done before this round: #191 (dependency-audit issue workflow), #193 (`build:usage` output
stays in the repository), and #194 (npm audit findings cleared; issue #192 closed).

## Lanes

| lane | agent (model, effort) | write set | status |
| --- | --- | --- | --- |
| v-public-docs | Claude Fable 5.1, high | report, then F1–F13 fixes | done |
| v-agent-docs | GPT-6-Astra, high | report, then VAD-03–VAD-07 fixes | done |
| v-structure | GPT-6-Astra, high | report, then VS-01/VS-02 fixes | done |
| v-tests | GPT-6.1-Sol, high | report, then VT-01/VT-02/F7 fixes | done |
| v-privacy | Grok 4.7, high | report | done |
| b-inventory | GPT-6.1-Sol, high | `scripts/`, `test/`, the drift skill, one TODO item | done |
| b-playground | GPT-6-Astra, high | `test/`, one TODO item, `happy-dom` | done |
| c-scanning | GPT-6-Astra, high | alert fixes and regression tests | done |
| review | Grok 4.7, high (new session) | report only | ready |
| memory and orchestration | Claude Opus 5.5 | memories, ledger, Git, GitHub settings | done |

Verification lanes run in a fresh session each and report only unsatisfied prompt bullets. Build
lanes each own one deferred `TODO.md` item on its own branch.

## Ledger

- `main` `e1307b45`: `npm audit` reports 0 vulnerabilities; the `dependency-audit` run on #194 reported
  "No findings and no open issue".
- Codex 0.159.2 updated itself to 0.159.3 on the first launch and exited; the five Codex lanes were
  restarted.

### Verification results (main `e1307b45`)

No lane found a high-severity gap, a live secret, or a reason to rewrite history.

- v-public-docs (13 findings): three files miss the simple-language bar (`ecosystem-skills/README.md`,
  `improvements/README.md`, `THIRD-PARTY-NOTICES.md`); one stale rule citation; `ARCHITECTURE.md`
  sections 2 and 6 repeat the mechanism references; stale `wrangler.jsonc` comments; an incomplete
  test map; a missing Algolia-key note; no doc for the dependency-audit workflow.
- v-agent-docs (7): a broken inline drift snippet and a routing command without `--gate`; two wrong
  observability facts; a truth-maintenance lint promise the code does not keep; a run-evals closeout
  step that would restore results history to guides; one TODO line that calls a diagnostic a gate.
- v-structure (2): 61 dated records without a current citation (mostly raw files of the two
  2026-09-30 rounds, plus ADR-0006 and the discovery-redesign records); July results in three eval
  guides.
- v-tests (2): `test/policy.test.ts` reads the private `.dev.vars` file and passes silently without
  it; a license test scans source spelling instead of returned content.
- v-privacy: code scanning covered only Actions; July go-public leftovers are justified or resolved.

### Decisions

- Owner (2026-10-01): add JavaScript/TypeScript to code scanning default setup (applied through
  `gh api`); delete the local `tmp/public-readiness/` July notes (done).
- Coordinator: ADR-0004 stays (current decision); ADR-0006 is deleted (Solo retired); the
  discovery-redesign decision moves to a new ADR-0009 before its records are deleted; machine paths
  in retained records stay (the username is the public handle).
- The JavaScript/TypeScript setup run passed. The first analysis opened 19 code scanning alerts, mostly
  in eval and test tooling (one in `src/site.ts`). A c-scanning lane (GPT-6-Astra, high) triages them
  on branch `fix/code-scanning-alerts`: fix real defects with tests, and give a reason for each
  dismissal.
- v-structure asked how to pin citations of records created after `6dd94394`. Answer: pin to a commit
  where the file exists (`e1307b45` for those records).

### Review

The reviewer (Grok 4.7, high) differs from every author and from the orchestrator. Grok is the
vendor-diverse tier; Codex and Claude Fable authored the changes.

- Verification fixes, inventory script, and Playground test: "ready", with two low findings. RG-1:
  `src/catalog/README.md` lost the cross-service victim rule when `ARCHITECTURE.md` section 2 was cut;
  restored and checked against `src/catalog/search.ts`. PG-1: the new page test never sent an error
  frame; an error-frame case now checks the note, the stalled card, and the enabled Send button.
- Code scanning branch: "ready", no findings. The reviewer confirmed the seven fixes and that the
  twelve dismissal reasons are true.

## Outcome

- Verification: every finding is closed, except VP-2 (decided: no change).
- Deferred work done: `scripts/diff-inventory.mjs` replaces the inline drift programs; the Playground
  page runs offline in a Happy DOM test.
- Code scanning now covers JavaScript/TypeScript. Seven real alerts are fixed with regression tests
  (an eval capture-proxy host override, four super-linear regular expressions, index table escaping,
  and credential redaction in refresh failure messages). PR #198 also rewrote the proxy URL and the CSP
  test's script extraction so CodeQL can verify them, which closed one test-only alert as well. After
  the analysis on `9d71abf8`, 8 alerts were fixed and the other 11 were dismissed with the triage
  reasons; 0 remain open.
- Each branch passed the CI-equivalent gates before review, including `npm audit` with 0 findings.
