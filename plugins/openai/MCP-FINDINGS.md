# OpenAI MCP findings: October 23, 2026

The October 23 portal scan reported three findings for the saved version `0.1.1`.
This record is not a fresh scan or a current OpenAI policy determination.
Recheck the linked rules and the existing submission before sending the exception follow-up.
The scan time is October 23, 2026, at 5:39:29 PM America/New_York.
These findings concern the shared `https://raven.stellar.org/mcp` endpoint.

## Findings and disposition

| Tool | Finding | Evidence | Disposition |
| --- | --- | --- | --- |
| `search` | Discovery enables operations that are not separate public tools. | The tool returns callable signatures for the generated catalog. | Request an exposure exception. |
| `execute` | Execution enables operations that are not separate public tools. | Model-authored JavaScript calls the host-controlled catalog through one tool. | Request the same exposure exception. |
| `execute` | `readOnlyHint: true` conflicts with a user-visible side effect. | A truncated OAuth result can create a private, expiring artifact. | Disclose persistence and request annotation guidance or an explicit exception. |

The portal uses this message for both exposure findings:

> This tool appears to execute operations that are not individually exposed. Please expose each model-callable operation upfront as a separate tool with a clear description, input schema, and annotations.

The annotation finding states:

> This tool is marked readOnlyHint: true, but its behavior appears to have a user-visible side effect.

## Why these findings remain

[OpenAI's exposure rule](https://developers.openai.com/plugins/plugin-guidelines#tool-independence-and-exposure) requires separate reviewable tools for callable operations.
The current two-tool interface does not meet that rule.
Renaming the tools or changing the ZIP does not resolve this conflict.

[OpenAI's annotation rule](https://developers.openai.com/plugins/plugin-guidelines#correct-annotation) requires `readOnlyHint: false` for artifact persistence.
The current `execute` annotation is `true` in `src/mcp/tools.ts`.
`src/executor/run.ts` stores oversized results for authenticated accounts.
`src/artifacts/store.ts` sets a seven-day retention period.
This is a real policy conflict, not a credential error.
The ZIP cannot override the server-provided annotation.

On October 23, the owner selected one endpoint and preservation of the accepted Claude implementation.
The owner selected an OpenAI exception instead of a separate endpoint.
The repair therefore changes no runtime source, tool schema, annotation, authentication route, or storage behavior.
No deployment is required for these submission-file updates.

## Evidence available for the exception

The manifest checked on October 23 contained 60 service operations and 20 skill entries.
The service split is 18 Lumenloop, 30 Scout, and 12 Stellar Docs operations.
The manifest SHA-256 is `4852f62608f105cfff34fdc7e01cdfe886bbeaca69250b8ea5f76d03d5208064`.
Its generation time is `2026-10-08T17:41:07Z`. These identify the reviewed snapshot, not current main.
Use the current generated manifest when preparing new correspondence.

The host controls endpoints, credentials, exposure, and argument validation.
`globalOutbound: null` blocks direct network access from model-authored JavaScript.
Paid research and upstream write operations remain excluded.
Artifact persistence uses the authenticated account and expires after seven days.
The listing already discloses that retention period.

These controls support a review request.
They do not establish compliance with the separate-tool or artifact-annotation rules.
An approved Claude submission does not establish an OpenAI exception.

## Next action

Use the updated [exception request](EXCEPTION-REQUEST.md) in the existing OpenAI review correspondence.
Include the [case report](REVIEW-CASES-2026-10-23.md) after all eight cases receive a reviewed outcome.
Keep reviewer passwords, OAuth tokens, and API keys out of that correspondence.
Keep them in the portal's secure reviewer fields.
Record OpenAI's written decision before describing any exception as approved.
