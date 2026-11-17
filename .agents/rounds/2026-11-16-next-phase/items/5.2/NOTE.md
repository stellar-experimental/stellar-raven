# Orchestrator note for item 5.2 (2026-11-17)

Item 5.2 is an owner follow-up that is not in PLAN.md; this note defines it and binds over
ITEM-LEAD.md. The evaluation behind it is `/home/tyler/code/raven-wt/orch/EVAL-FABLE.md`. Read items
A, C, D, E, F, H and I, and use its "If act" text and its rule and TODO wording as the starting
draft. Start after item 5.1 has merged, from current `origin/main`.

## Owner answers (2026-11-17), to record in DECISIONS.md

Add these under a new section, "Follow-up answers (2026-11-17)", quoting the owner where quoted.

- **stellar.org findings.** Owner: "Do these even belong? They seem separate to the concerns those
  sites actually serve". The evaluation: `sd-077` and `sd-111` belong, and the owner forwards them
  to the SDF web team. `sd-113` does not belong and is not forwarded.
- **`scout.matchPartners`.** Removed by item 5.1, on the owner's "isolated rare events likely don't
  constitute making everything call and experience worse, more expensive".
- **stellar.org displacement.** Closed as accepted. Owner: "sounds good if you really believe it and
  there's no clear obvious compromise".
- **FAM rows.** The owner deferred to the orchestrator. Decision: no move, and the sealed set stays
  sealed and unspent.
- **Maintenance exception.** Owner: "sure, if you think that's warranted and worth it". Adopted.
- **OpenCode.** Kept out of client diagnostics. OpenCode 2.2.7 offers Anthropic only through an API
  key. The owner logged OpenCode in with ChatGPT and SuperGrok on 2026-11-17, on the Mac and on agentpc, each checked with one trivial prompt, so those subscription
  logins exist if the item reopens.

## Scope: one PR, documentation and corpus rule only

1. **C.** Close the TODO item "Treat stellar.org routing reach as a lexical and description question"
   as accepted.
   - Rewrite the "Routing reach" bullet in "Prove the stellar.org source" with the standing numbers.
   - Name the reopen trigger: a production transcript where a `stellarOrg` card cost an answer.
2. **D.**
   - Move the FAM development rows' archive pointer into "Preserve structured routing intent". The
     pointer is the bundle ref, the path and SHA-256 `0246ad02…`. Add that a second copy of
     `~/backups/fd-2026-11-14/split/` is now on the Mac, hashes checked.
   - Shrink "Decide what test earns the sealed FAM confirmation rows" to a hold.
3. **E.** Add the maintenance-exception rule to `eval/qa/README.md`, "Held-out split".
   - Use the evaluation's text, tightened if the Fable review says so.
   - Reduce the TODO owner question to the left-open register entries.
   - The dated briefs under `items/1.4/dated/` should know the exception exists. Read them. If a
     brief tells a lead to move cases it opens, change it to apply the exception. Those leads run
     from timers starting 2026-11-23.
4. **A.**
   - Add one evidence line to `sd-113`: not forwarded (owner, 2026-11-17), out of scope for
     stellar.org, Pi Network owns the fact. Keep its status `verified`, and do not delete it.
   - Drop `wallets.pi-network` from the candidates in "Audit source coverage".
   - `sd-077` and `sd-111` stay `verified`. Add a note that the owner forwards them to the SDF web
     team; the orchestrator sets `reported-upstream` once the owner confirms.
   - Update the "Audit register (done)" bullet to match.
5. **H.**
   - Verify for free that a script that throws a non-Error is recorded as `ok`. Use one local run
     against `npm run dev:eval` (no model call), or a unit-level reproduction of the pinned
     `@cloudflare/codemode` executor.
   - File a `canonical-source` finding against the codemode upstream (`cloudflare/agents`) with
     `improvements-pipeline`, check for duplicates, and post the issue (standing authority,
     decision 4).
   - Delete the TODO sentence, and add the re-check clause to "Re-check the upstream codemode
     short-token repair".
6. **I.** Replace the TODO item "Run the OpenCode lane of round item 4.1 after a re-login (owner)"
   with the evaluation's "OpenCode stays out" text, or record it in the ledger and delete it.
7. **F.** Record no action in the ledger row: the 3.5 surface hash is unchanged, so the live check
   carries no information.

## Rules

- Work on no held-out or reserve case.
- Make no product code change. If one seems needed, stop and report.
- Gates:
  - `npm run eval:qa:lint`;
  - the improvements lint;
  - `typecheck`;
  - `test`;
  - `secrets:scan -- --tree`.
- Reviews: Fable plan review only. Also the distinct reviewer that `improvements-pipeline` requires,
  if it requires one for a new finding.
- No deploy is expected; say so in REPORT.md.
- No model-calling eval and no paid call.
