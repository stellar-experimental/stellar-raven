# Stellar Raven OpenAI plugin

This directory contains a separate OpenAI plugin package.
The package connects to the existing production server.
It does not change the Claude connection or the server implementation.

**Last recorded portal status (October 23, 2026): version 0.1.2 was in review and not published.**
The eight-case rehearsal passed on that date. Portal status, reviewer access, and any exception
decision need a fresh check before further submission or publication work.

The owner supplied the rejection on October 23, 2026.
The previous version shows `0.1.0 · Changes required`.
The repair created version `0.1.1`, then updated the same draft to `0.1.2`.
The portal restored the production endpoint and confirmed domain verification during connection setup.
The dedicated reviewer account passed direct email/password sign-in in a fresh Chrome private window.
Its complete MCP OAuth flow passed initialization, tool discovery, `search`, and `execute` checks.
The portal retained all five secure reviewer fields after reopening them.
The owner completed the legal declarations and submitted the version on October 23, 2026.
The October 23 portal inspection confirmed `0.1.2 · In review` in the metadata version selector.
The [case report](REVIEW-CASES-2026-10-23.md) records the initial failures and the verified package fix.
The [three MCP findings](MCP-FINDINGS.md) still need OpenAI's exception decision.
The owner reconfirmed the single-endpoint exception approach on October 23.
The shared server and the accepted Claude interface remain unchanged.
Use [the resubmission record](RESUBMISSION.md) for the completed repair and reviewer-access procedure.
The October 7 checks below describe the earlier submission.

## Confirmed publication choices

The owner confirmed these choices on October 7, 2026:

- Publisher: Stellar Development Foundation.
- Countries: all available countries.
- Commerce: no payments or purchases.
- Branding: the existing Raven icon and orange color.

`publication.countries: []` removes country restrictions.
The portal must confirm the selected verified publisher before submission.
The package does not prove business verification.

## Package contents

`stellar-raven/plugin.json` contains the listing, publication choices, and eight review cases.
`stellar-raven/mcp.json` contains the verified Streamable HTTP endpoint.
`stellar-raven/assets/raven-icon-512.png` copies the existing Raven icon.

The package uses the three existing Claude example prompts.
It includes five positive cases and three negative cases.
Those cases describe the current `search` and `execute` tools.
Revise their tool expectations if the submitted server changes.

The package includes no bundled skills, app bindings, credentials, or server source.
The server retrieves its existing playbooks through the current MCP connection.

## Public review requirements

### Tool exposure

[OpenAI guidelines](https://developers.openai.com/plugins/plugin-guidelines#tool-independence-and-exposure)
require each callable operation to have a separate reviewable tool.
The current discovery and generic executor design conflicts with that requirement.
A ZIP cannot change this server behavior.

The owner selected an OpenAI exception request on October 7, 2026.
Preserve the existing `/mcp` endpoint and its Claude contract.
Use [the prepared request](EXCEPTION-REQUEST.md) to ask for written OpenAI guidance.
The owner authorized submission while the exception request remains pending.
Submit the existing design if the portal permits review with findings.
Resolve required portal errors before submission.
Do not wait solely for the support response.
Do not substitute an unverified endpoint in `mcp.json`.
Do not deploy changes to the shared server merely to complete this package.

### Annotations, authentication, and data

The current `execute` tool can persist large results for seven days.
Its `readOnlyHint: true` conflicts with OpenAI's artifact persistence rule.
Assess `openWorldHint` against the submitted tool's actual retrieval scope.
The package cannot override MCP tool annotations.

The earlier OpenAI audit also identified OAuth resource and scope checks for review.
It identified privacy coverage for stored results, upstream recipients, and usage records.
Confirm these requirements against the final submitted endpoint.
Do not replace the shared Claude authentication contract without a separate reviewed change.

The submitted package retains the existing privacy URL.
Its public accessibility does not prove complete coverage of Raven's data practices.
Resolve policy coverage before publication. The existing `/terms` source still describes query/response
logging for 30 days, while [operations](../../docs/operations.md#data-retention) describes operational
metadata retention of at most seven days; see [the policy observation](VERIFICATION.md#policy-observation).
Confirm the authorization and terms for the independently operated sources.

### Review materials

All eight cases passed the October 23 Codex rehearsal for version `0.1.2`.
The report records the method and its limits.
The earlier submission used a dedicated reviewer API key.
The server accepts that key in the `Authorization: Bearer` header.
The portal does not support API-key connection setup.
Use the dedicated Raven reviewer account for the existing OAuth sign-in flow.
The portal now stores its email and password in the secure reviewer fields.
The October 23 check required no MFA, email code, or additional account setup.
Record the actual tool calls, arguments, and returned evidence.
Keep account credentials in the portal's secure reviewer fields.
Do not include credentials in the ZIP.

The task saved a real live demonstration at `tmp/openai-plugin/stellar-raven-demo-2026-10-07.mp4`.
The recording uses the existing authenticated Raven connection.
The task checked complete video decoding and three readable frames.
The recording does not show package installation or dedicated reviewer sign-in.
The owner approved a public upload to the SDF account's existing `the-dump` bucket.
The package includes the [verified recording URL](https://pub-b2eaaee2bbe74d70820bacb7298958f5.r2.dev/stellar-raven/openai-review/2026-10-07/stellar-raven-demo-c0fcfd39.mp4).
The public response matches the checked local video.
A clean browser session verified playback and seeking without a login.
This `r2.dev` URL serves the draft review copy.
[Cloudflare reserves these URLs for development use](https://developers.cloudflare.com/r2/buckets/public-buckets/).
Use an SDF-approved custom domain for permanent production hosting if required.
Do not claim that a recording script is a completed demo.

## Recording steps

1. Connect the packaged version in ChatGPT or Codex through the configured authentication.
2. Start a screen recorder after account sign-in.
3. Ask the persistent storage TTL prompt.
4. Show the actual tool result, explanation, and official source link.
5. Ask the lending and SCF prompt.
6. Show the source records and the distinction between submissions and awards.
7. Ask the passkey prompt and show the retrieved playbook and reference links.
8. Ask the transfer prompt and show the capability limit without a tool call.
9. Stop the recorder and play the saved recording.
10. Check readable text, working playback, and the absence of credentials or private account content.
11. Host the recording at a reviewer-accessible location.
12. Verify playback without a private account login.
13. Add the verified URL to `review.demo_recording_url` and rebuild the ZIP.

Computer control can help demonstrate the plugin while the owner records the screen.
Screenshots alone do not provide the required recording.

## Build the draft archive

Run these commands from the repository root:

```sh
mkdir -p tmp/openai-plugin
cd plugins/openai
zip -X -r ../../tmp/openai-plugin/stellar-raven-0.1.2-draft.zip stellar-raven
```

Inspect the archive after each change.
It must contain one `stellar-raven/` directory with the declared files.
Keep review evidence and preparation notes outside the upload directory.

## Existing work and sources

The package retains the current Raven identity, source, hosting, and authentication.
The earlier Claude work remains the baseline:

- `65f38b83`: the execute scope and result-storage description.
- `aa004d7d`: the source operator credits.
- `8c0e6ee2`: the hosted Raven icon and logos.
- `dd8724e5`: the hosted brand and listing images.

The saved OpenAI research supplied the package and requirement draft.
This task rechecked the current primary documentation before packaging.
The research's proposed server redesign did not authorize changes to the Claude endpoint.

Reference documents:

- [Package and submission](https://developers.openai.com/plugins/deploy/submission).
- [Plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines).
- [MCP review](https://developers.openai.com/plugins/deploy/app-review).
- [Raven support](https://raven.stellar.org/docs).
- [Raven terms](https://raven.stellar.org/terms).
- [Published SDF privacy policy](https://stellar.org/privacy-policy).

## Earlier portal state: October 7, 2026

These are historical observations, not current portal or credential status.
The portal accepted the upload with an individually verified developer account.
The saved listing named Stellar Development Foundation as the developer.
Individual verification did not establish SDF business verification.
Locate the existing Stellar Raven submission in the authorized owner’s plugin portal;
private account and submission identifiers stay outside the repository.
The portal imported all five positive cases and all three negative cases.
It imported all-country availability, the verified video URL, and the release notes.

The task published the domain challenge through a separate verification Worker.
Its only route is `raven.stellar.org/.well-known/openai-apps-challenge`.
The source is in [domain-verification/](domain-verification/).
The shared Raven deployment and its existing route stayed unchanged.
The portal verified the domain, authorized OAuth, and discovered `search` and `execute`.

The reviewer key is `openai-review-20261007`.
It passed MCP initialization, tool listing, search, and execution checks.
The portal saved it in the secure reviewer password field.
The saved instructions explain `Authorization: Bearer` authentication.
The credential stays outside the ZIP and repository.
Reviewer acceptance of API key access remains unconfirmed.
Revoke the key after the final review decision.

The scan reports three findings about operation exposure and the executor's read-only annotation.
The final form states that these findings do not block submission.
The owner completed the final legal declarations and submission action.
The portal now shows `Version 1.0.0 · In review` and `Not published`.
The package metadata version remains `0.1.0`.
The exception request remains pending and has no confirmed approval.
Keep the reviewer key active until the final review decision.
Revoke it after that decision.
Publishing requires a separate owner instruction after approval.
Independent review remains outstanding.
