# Item 8.3 executor, round 2: reconcile the Codex review

Read `.agents/rounds/2026-11-16-next-phase/items/8.3/CODEX-REVIEW.md` (Codex workhorse
`gpt-6.2-sol`, high). Every finding is adopted. Fix each one, with a test that asserts on the
written artifact where the finding is about an artifact. The lead's direction per finding:

1. Persist a judge-identity failure in every checkpoint and at finalization, inline and
   `--judge-stored`. Add a comparability reason, suppress aggregates and promotion, put the row in
   `incompleteIds`, and keep that status across resume. Assert on the written file in the mixed
   and unknown tests.
2. An unresolved successful answering row stays `null` for either request type, and gets a
   comparability reason. Contradictory capture (init and usage disagree, or a usage key that is
   not the exact request) is unknown and never falls back to the request. `meta.model` comes from
   the measured successful rows (their single exact ID), not from the pin. A pin that conflicts
   with the measured rows is a comparability reason. Do the same in the discovery runner.
3. `compare-architecture-ab.mjs`: reject `meta.comparable === false`, and require an exact
   non-null, non-alias answering ID. When judged, also require an exact judge ID. Check the
   row-level `agent.model` values against `meta.model` when present. Legacy v4 files with exact
   IDs stay comparable, and answer-only comparison still works.
4. Re-judge and the Playground: the same-judge guard requires known exact IDs (non-null,
   non-alias) on both sides. Legacy `judge.model` counts as identity only when it is not an
   alias. The v3 validator rejects an alias or an empty string in `judge.resolvedModel`, and
   checks it against the request's family when the request is an alias. Create the re-judge pin
   before the initial checkpoint, so `meta.judgeModel` never holds an alias. Unresolved stored v3
   artifacts stay readable with their existing hash.
5. Playground: settle the judge call's returned cost first. Keep the model evidence, then stop
   with `judge-model-identity` and a non-promotable artifact. Add an orchestrator-level test.
6. Resume: when the file recorded `judgeModel: null` with a `judgeRequestedModel`, refuse an
   explicit different `--judge-model`. Keep using the recorded resolved ID after a pin.
7. Stability register: collect judge identities from both sides of every contributing pair, and
   record whether any contributor's identity is unknown. `stabilityRegisterJudgeMatch` is `true`
   only when every contributor is known and equals the judge in use. It is `false` when a known
   contributor differs, and `null` otherwise.
8. Self-test: require an exact `--judge-model` (refuse an alias), and fail a candidate whose
   reported model differs from it. Do not add a key to the strict call record. Document in
   `eval/qa/README.md`: resolve the alias first (the roster's one-call read), then pass the exact
   ID. Update the TODO self-test item to match.
9. Grok resolver: skip malformed entries (a null value, or no usable id). Add a test that mixes
   malformed, hidden and valid entries.
10. Reject conflicting same-family usage keys even after pinning or for an exact request, while
    still ignoring other families. Extend the test.
11. Print `fetched_at` only when it parses as a date, in normalized ISO form; otherwise print
    nothing.

Lead nit: in `.agents/model-roster.md` "Models for evals and tests", the Codex and Grok flag cells
show the inline `$(...)` form that the launch-lines section warns against. Make them `-m "$M"` /
`--model "$M"`, resolved in the two-step form below.

Prefer the smallest change that meets each point. If a point needs a design the plan did not
foresee, or would strand stored artifacts, stop and report instead.

The same rules as your first brief apply (`briefs/exec.md`): the search rule, no model call of any
kind, the not-edited paths, no subagents, gates run bare, normal commit hooks, and the
Co-Authored-By line. Also commit `PLAN.md`, `REVIEW.md`, `CODEX-REVIEW.md` and `briefs/` under
`items/8.3/` (they are the lead's files; commit them unchanged). Append a "Round 2" section to
`EXEC.md`: a disposition and a test for each finding, the gates, and any deviation. Commit it, and
report with `hc send <lead terminal> '<abs EXEC.md path>'` as before.
