---
id: sk-004
service: skills
status: reported-upstream
discovered: 2026-07-03
evidence:
  - live probe 2026-07-03: find_av_passages returns only summary/long_summary (AI-generated) + start_offset — no transcript text field
  - lumenloop/lumenloop-skills @ d92c56b — stellar-project-dossier SKILL.md pipeline row 5 ("Direct quotes … transcript passages to quote"); stellar-ecosystem-digest Quality rules ("only find_av_passages gives verbatim passages")
  - Solo project 49, todo 825 (skills-harvest verification pass)
  - live re-verified 2026-07-06 (eval round todo 846): find_av_passages still returns only AI-generated summary/long_summary + start_offset — no transcript/verbatim text field
  - upstream issue filed 2026-07-07: https://github.com/lumenloop/lumenloop-skills/issues/1
recurrences:
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: Fresh Lumenloop dossier,digest,integration-finder main source; LL find_av_passages passkeys query — Dossier Direct quotes, digest verbatim and integration-finder direct quote persist; response has only AI summaries and offsets. Adjacent third skill remains part of action. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row sk-004."
  - date: 2026-08-11
    evidence: upstream dossier still labels find_av_passages output as Direct quotes and transcript passages to quote; upstream digest still says only find_av_passages gives verbatim passages. The current exposed operation description states that it returns AI summaries, an opaque start_offset, and a link, never transcript text.
  - date: 2026-11-02
    evidence: "Golden audit 2026-11-02 (batch soroban-04, case q-soroban-av-passkeys-talk). 2026-11-02T17:18:11Z authenticated POST https://api.lumenloop.com/v1/tools/find_av_passages {query: 'passkeys smart wallets on Soroban', limit: 3} returned success with row keys av_id, channel, created_at, long_summary, similarity, slug, start_offset, summary, title, url; no transcript or chunk-text field. lumenloop/lumenloop-skills main a87ca95730d2a4015c884defebd66b44ea01d3b2 (2026-10-12, CI-only change since the pinned d92c56b; SKILL.md bytes identical) still has stellar-project-dossier SKILL.md line 51 'Direct quotes | find_av_passages(query) | transcript passages to quote' and lines 157-158 'surfaces the actual passage where something was SAID', and stellar-ecosystem-digest lines 240-241 '(only find_av_passages gives verbatim passages)'. Adjacent location not in issue 1: stellar-integration-finder line 99 'Use find_av_passages(...) when you want a direct quote'. Raven codemode.skill.read of all three served the same lines on 2026-11-02. The Lumenloop GET /v1/tools description still says the tool returns 'the matched chunk text' (Lumenloop-side contract, ll-019). Issue 1 is open with 0 comments."
---

## Finding

Two `lumenloop-skills` playbooks teach that `find_av_passages` yields **verbatim,
quotable transcript passages**: `stellar-project-dossier` labels it "Direct quotes /
transcript passages to quote", and `stellar-ecosystem-digest` states "only
find_av_passages gives verbatim passages" as a quality rule. On the external lane
the tool returns only AI-generated `summary` / `long_summary` plus an opaque
`start_offset` — no transcript text field exists in the response. An agent following
the playbook will present an AI summary as a direct quote, which is exactly the
misattribution the digest skill's own "never present summaries as direct quotes"
rule tries to prevent.

## Evidence

Live probe above (2026-07-03): response item keys are `av_id, channel, created_at,
long_summary, similarity, slug, start_offset, summary, title, url`. Consistent with
the upstream tool description ("Transcript text itself is never returned — cite the
link + the passage summary").

## Recommendation

In `lumenloop/lumenloop-skills`: reword dossier pipeline step 5 to "passage-level
summaries to cite (with link + date), not verbatim quotes", and fix the digest
quality rule to say find_av_passages localizes WHERE a topic is discussed but its
text is still an AI summary — verbatim quotes require following the returned url.
