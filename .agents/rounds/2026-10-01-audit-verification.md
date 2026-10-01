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
| v-public-docs | Claude Fable 5.1, high | report | verify |
| v-agent-docs | GPT-6-Astra, high | report | verify |
| v-structure | GPT-6-Astra, high | report | verify |
| v-tests | GPT-6.1-Sol, high | report | verify |
| v-privacy | Grok 4.7, high | report | verify |
| b-inventory | GPT-6.1-Sol, high | `scripts/`, `test/`, the drift skill, one TODO item | build |
| b-playground | GPT-6-Astra, high | `test/`, one TODO item, any test config | build |
| memory and orchestration | Claude Opus 5.5 | memories, ledger, Git | running |

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
