# Independent review: `sk-025` Trustless Work beta auth scope

Reviewer: Grok high (Grok 4.6).
Clock: `2026-09-16T19:31:12Z`.
Mode: audit only. No owned-code edits, GitHub posts, or authenticated API calls.
Candidate file: `/tmp/raven-execution-2026-09-16/pr157/improvements/skills/sk-025-trustless-work-beta-auth-scope.md`.

## Verdict

**Approve `sk-025` as `reported-upstream`.**

The live sources match the finding. The scope stays on the beta host. It does not claim V1 bearer support. It does not claim a deployed authenticated acceptance test. Issue #6 already owns version and authentication scope. Comment `5703275444` is new evidence on that issue, not a duplicate filing.

## Live sources, independently fetched

| Source | Result |
|---|---|
| Pinned `skills/api/v2/core-concepts.md` at `634f32bd` | Host is `https://beta.api.trustlesswork.com`. Authentication: `` `x-api-key` on **every** request, including reads. Never `Authorization: Bearer`. `` |
| Official Core API introduction (2026-09-16 `.md`) | Base URL tab and warning name `beta.api.trustlesswork.com` as the new Core API on testnet. Authentication: every request carries either `x-api-key: <id>.<secret>` or `Authorization: Bearer <jwt>`. Separate V1 hosts remain `api.trustlesswork.com` and `dev.api.trustlesswork.com`. |
| SDK `http-transport.ts` at `4121f925` | Sets `headers["x-api-key"]` when an API key exists. Sets `headers.Authorization = \`Bearer ${token}\`` when `getAccessToken` returns a token. |
| Pinned V1 `skills/api/core-concepts.md` | Uses `api.trustlesswork.com` / `dev.api.trustlesswork.com` and `x-api-key` examples. No beta host. No “Never Bearer” sentence in the scanned auth/base-URL lines. |
| Pinned `constitution.md` L114 | Enforced `x-api-key` on every request, “Never `Authorization: Bearer`”, with a 401 claim for missing keys. No beta-host exception. |

This lane did not send an authenticated request to `beta.api.trustlesswork.com`. The finding’s refusal to claim deployed bearer acceptance is correct.

## Scope

The finding names the beta API profile and the beta host only.
It tells the owner to keep the V1 API-key rule unless separate V1 evidence changes it.
That matches the live files: V1 and beta are different hosts, and the Core API warning says they are not interchangeable.

The shared constitution still forbids Bearer without a profile split. The recommendation to qualify that constitution is in-scope and does not convert this into a V1-mainnet bearer claim.

## Upstream issue and comment

- Issue: [Trustless-Work/trustlesswork-skill#6](https://github.com/Trustless-Work/trustlesswork-skill/issues/6), OPEN, title “Version the skill around V1 mainnet and V2 beta protocol profiles”.
- Comment: [issuecomment-5703275444](https://github.com/Trustless-Work/trustlesswork-skill/issues/6#issuecomment-5703275444), author `kalepail`, created `2026-09-16T19:25:45Z`.
- Search of that repo for bearer/authentication hits #6 as the open tracking issue. No second open issue for this defect.

The comment author is Raven (`kalepail`), not an upstream maintainer. The finding records that direction. `reported-upstream` is valid because the durable GitHub ref exists. It is not maintainer acceptance of the fix.

## Intake and identity

`improvements/intake.json` override:

```json
"sk-025": {
  "repo": "Trustless-Work/trustlesswork-skill",
  "reason": "The upstream beta skill owns its authentication guidance and shares the existing version-profile issue."
}
```

That repo matches the skill source. The skills service default already lists this repository; the override still prevents a mixed-skills default from filing the wrong owner.

`sk-025` is unused in `improvements/resolved.json`. Active skills files stop at `sk-024` before this record. The ID is unique.

## Remaining non-blockers

- INDEX already lists `sk-025`. Parent should keep `npm run improvements:index` and `improvements:lint` on the landing commit.
- The constitution 401 sentence is V1/deployed-key evidence. Do not stretch `sk-025` to prove or disprove that claim.
- Do not open a second upstream issue.

No other actionable defect in this finding or intake override.
