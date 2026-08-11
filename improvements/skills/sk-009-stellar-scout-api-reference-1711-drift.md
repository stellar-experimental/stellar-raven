---
id: sk-009
service: skills
status: reported-upstream
discovered: 2026-07-10
evidence:
  - live drift issue kalepail/stellar-raven#19: inventory/stellar-light.json refreshed to OpenAPI/status 1.7.11
  - live 2026-07-10 OpenAPI verification: projects/search adds semantic fallback metadata and Project tvlUSD/tvlAsOf; research adds source=cap
  - ecosystem-skills/skills/stellar-light/stellar-scout/references/api-reference.md at pinned upstream commit aea0c125325ceed746eefaa505e3bd45dabd5ca1
  - Solo scratchpad 575 drift verdict and independent read-only review by process 3209
  - upstream issue filed 2026-07-13: https://github.com/Stellar-Light/stellar-scout/issues/11
  - 2026-07-14 follow-up narrows the residual after source=cap landed: https://github.com/Stellar-Light/stellar-scout/issues/11#issuecomment-4971409842
  - 2026-07-15 pin 7a5a27 and live OpenAPI 1.7.26 verification: research adds source=sdf-org and observedAt; leaderboard adds exact type filtering plus filter and metric metadata, while the mirrored reference omits them
  - 2026-08-10 live OpenAPI 1.8.40 verification: Repo adds activityState/activitySignals, contractInterface, protocolCaps, stellarDeps, and targetProtocol; searchRepos adds activity; research adds source=repo-docs. The pinned f2659ff API reference contains none of those surface names.
recurrences:
  - date: 2026-07-15
    evidence: the 1.7.26 mirror still omits live research source=sdf-org and observedAt plus leaderboard type, meta.filters.type, meta.metricDefinitions, and meta.dataAsOf
  - date: 2026-07-30
    evidence: upstream stellar-scout main at f2659ff still names the retired soroban skill in its SDF roster, skills.stellar.org URLs, and exact GET /api/skills/soroban examples, while live OpenAPI 1.8.30 names smart-contracts and production returns 200 for /api/skills/smart-contracts versus 404 for /api/skills/soroban
  - date: 2026-08-10
    evidence: refreshed inventory/stellar-light.json OpenAPI 1.8.40 adds Repo activityState/activitySignals, contractInterface, protocolCaps, stellarDeps, targetProtocol, the searchRepos activity parameter, and research source=repo-docs; the pinned f2659ff references/api-reference.md has no occurrences of those surface names
---

## Finding

The pinned Stellar Scout skill API reference has fallen behind the live Scout
OpenAPI contract from 1.7.11 through 1.8.40. This is new drift after `sk-008` was fixed for the
earlier 1.7.0 partner and repository fields, so it is a successor rather than a
reopening of that resolved finding.

The live API now documents three capabilities absent from the served skill:

- `GET /api/projects/search` can return a `semantic` match mode when no keyword
  tier matches; each fallback row is marked `via:"semantic"` and should be
  treated as a medium-confidence similarity guess.
- Project records can carry `tvlUSD` and `tvlAsOf`, where `null` means not
  tracked by DefiLlama rather than zero TVL.
- `GET /api/research` accepts `source=cap` for CAP material.
- `GET /api/research` also accepts `source=sdf-org`, and research rows can carry
  `publishedAt` and `observedAt` provenance dates.
- `GET /api/leaderboard` accepts repeatable or comma-separated exact `type`
  filters and returns the resolved filter plus metric definitions and data date
  in `meta.filters.type`, `meta.metricDefinitions`, and `meta.dataAsOf`.
- Repo records now expose derived `activityState`, dated `activitySignals`,
  Soroban `contractInterface`, `protocolCaps`, `stellarDeps`, and
  `targetProtocol`; `GET /api/repos/search` accepts `activity`, and research
  accepts `source=repo-docs`.

Agents that read the served skill can therefore misread semantic results as
keyword-confirmed, collapse untracked TVL to zero, or omit the new CAP source
filter, miss SDF organizational research, or overlook leaderboard filtering and
provenance even though Raven's regenerated operation schemas expose them.

## Evidence

Live verification on 2026-07-10 and the regenerated inventory show:

- `inventory/stellar-light.json` adds `semantic` to the project-search
  `matchMode` enum and describes it as a vector-similarity fallback used only
  after keyword tiers miss.
- The same schema adds nullable `tvlUSD` and `tvlAsOf` fields to Project.
- The research-source enum adds `cap`.

The pinned upstream reference still says a `majority` miss returns an advisory
to use `/api/research`, lists no `semantic` tier, omits the TVL fields, and its
research source list omits `sdf-org`. Its leaderboard parameters omit `type`,
and its result documentation omits the filter, metric-definition, and data-date
metadata:

- catalog id `skills.stellar-light.stellar-scout#file:references/api-reference.md`, served from
  the commit pinned in `ecosystem-skills/MANIFEST.json` — read it with
  `codemode.skill.read`, or fetch the pinned `transport.url` recorded in
  `catalog/manifest.json`. Sections: project match modes; leaderboard parameters; research
  sources.

There is no local copy to correct — bodies are served from upstream, not stored here. The
correction belongs in the upstream `Stellar-Light/stellar-scout` source and reaches Raven only
through a re-pin (`ecosystem-skills/update.sh` → body-diff review → `PIN-REVIEW.md` attestation →
catalog/micro-map/spec/op-class rebuild → deploy).

## Recommendation

Update the Scout skill API reference to document the `semantic` result tier and
its confidence caveat, Project `tvlUSD`/`tvlAsOf` null semantics, and the
`source=cap` and `source=sdf-org` research filters with provenance dates. Also
document leaderboard `type` filtering and its returned filter, metric, and data
date metadata. Add the Repo activity, interface, dependency, and protocol
fields; the `activity` filter; and the `repo-docs` research source. Add a small
schema-to-reference drift check so a new enum value or documented field produces
a review signal before the skill lags another live release.
