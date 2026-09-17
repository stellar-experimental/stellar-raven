---
id: sk-025
service: skills
status: reported-upstream
discovered: 2026-09-16
upstreamTitle: Beta API skill excludes bearer authentication documented by the Core API
evidence:
  - 2026-09-17 routing-audit baseline artifact 2026-09-17T01-33-03-variantA.json (sha256 ef988d64c2070f98196f2981d7028d66158492a85745be558c1c4e0bbf08afa0), row q-tw-escrow-api-auth-custody, repeats the V1 API-key rule without identifying the separate Core API profile. Live beta skill still requires x-api-key and forbids Authorization Bearer; SHA-256 959e697c7188c0adb48fe6218a78e813d395e645602c315c3146dc5cf861dc24. Issue 6 remains open.
  - The active golden case records the disputed authentication scope and caller-custody boundary at eval/qa/corpus/battery/compliance-rwa-payments/q-tw-escrow-api-auth-custody.json.
  - New beta authentication evidence posted by kalepail on 2026-09-16 and read back at https://github.com/Trustless-Work/trustlesswork-skill/issues/6#issuecomment-5703275444. The existing issue owns the version and authentication scope.
  - 2026-09-16 live main is 634f32bd4be6769b0cae52e72db4899d5f5a069c. Its trustless-work-dev/skills/api/v2/core-concepts.md identifies beta.api.trustlesswork.com, requires x-api-key on every request, and forbids Authorization Bearer.
  - https://raw.githubusercontent.com/Trustless-Work/trustlesswork-skill/634f32bd4be6769b0cae52e72db4899d5f5a069c/trustless-work-dev/skills/api/v2/core-concepts.md
  - 2026-09-16 live official Core API introduction identifies the same beta host and documents either an API key or a wallet-session bearer token.
  - https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/introduction
  - https://github.com/Trustless-Work/trustlesswork-sdk-js/blob/4121f92593b74643fc9e16b3d7d13cdd0a620914/src/transport/http-transport.ts
  - Independent Grok 4.6 high source review and the Astra coordinator both reproduced the source conflict.
---

## Finding

The beta API skill forbids `Authorization: Bearer` for requests to `https://beta.api.trustlesswork.com`.
The current Core API documentation permits a wallet-session bearer token for that same host.
The JavaScript SDK also constructs bearer headers from its access-token callback.
An agent that follows the skill can reject a documented authentication method.

This finding concerns the beta API profile.
It does not establish bearer support for the separate V1 mainnet or development hosts.

## Evidence

At commit `634f32bd4be6769b0cae52e72db4899d5f5a069c`, the beta reference requires `x-api-key` on every request.
Its next sentence states `Never Authorization: Bearer`.
The official Core API introduction identifies the same beta host and documents both authentication methods.
The SDK transport at `4121f92593b74643fc9e16b3d7d13cdd0a620914` sets `Authorization` when its access-token callback returns a token.

The shared constitution also presents the API-key requirement without a beta exception.
The V1 references retain their own API-key guidance.
A sweep checked all 22 files selected by the Raven source proposal.
The direct beta contradiction occurs in `skills/api/v2/core-concepts.md`.

These checks establish conflicting public guidance and SDK header construction.
They do not establish deployed bearer-token acceptance through an authenticated API request.

## Recommendation

Scope the authentication rule by API profile and host.
Document the Core API wallet-session flow in the beta reference after checking the applicable server contract.
Preserve the V1 API-key rule unless separate V1 evidence changes it.
Qualify the shared constitution so it does not override the beta profile.
Keep the authentication guidance consistent with the current Core API documentation and SDK.
