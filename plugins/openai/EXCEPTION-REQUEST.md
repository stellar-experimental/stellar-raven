# Stellar Raven: OpenAI review exception request

Historical draft: follow-up prepared on October 23, 2026 and not sent at that time.
Refresh portal status, catalog details, and the linked policy requirements before sending.
No later correspondence or exception decision is established by this record.
The owner submitted version `0.1.2`; the October 23 inspection recorded `0.1.2 · In review`.
The owner selected one endpoint and preservation of the accepted Claude implementation.
The owner selected an OpenAI exception instead of a separate tool interface.
The three findings remain unresolved. No exception has written approval.

## Existing correspondence

OpenAI Support received an exception request on October 7, 2026.
The task supplied the contact email `frontier@stellar.org` and requested human escalation.
The support chat displayed `Escalation requested`.
No support case number or written exception decision is confirmed.
The transcript remains at `tmp/openai-plugin/support-escalation-2026-10-07.txt` outside the upload directory.

OpenAI later rejected Stellar Raven because reviewers could not complete sign-in or OAuth.
The October 23 repair corrected reviewer access and verified the email/password OAuth flow.
Use the existing rejection email for this follow-up.
Do not create a duplicate plugin or include reviewer credentials in the message.

## Follow-up text

Hello,

We resubmitted Stellar Raven, version `0.1.2`, after correcting reviewer access.
The portal now shows “In review.”
The secure reviewer fields contain a dedicated email/password account and updated OAuth instructions.
A fresh browser session completed sign-in without MFA, email codes, or additional setup.
We also verified MCP authorization, tool discovery, `search`, and `execute`.
All eight submitted cases passed our Codex rehearsal with reviewer OAuth.

We also request human review of three remaining MCP findings:

- `search`: operations are not individually exposed as separate tools.
- `execute`: operations are not individually exposed as separate tools.
- `execute`: `readOnlyHint: true` conflicts with private result storage.

Stellar Raven uses one endpoint: `https://raven.stellar.org/mcp`.
Its two tools use a fixed catalog with 60 service operations and 20 skill entries.
The host controls endpoints, exposure, argument validation, credentials, and service requests.
The sandbox has no direct network access.
Paid research and upstream writes remain unavailable.

We recognize that this design conflicts with the separate-tool exposure requirement.
We request an exception for this design.
We want to preserve the shared endpoint accepted for our Claude submission.
This repair changed no production server code, tool definitions, annotations, or authentication routes.

Large redacted results can persist privately for the authenticated account for seven days.
The listing and tool description disclose this behavior.
We recognize that OpenAI's annotation rule requires `readOnlyHint: false` for result storage.
Please confirm whether you can approve an exception or require a shared annotation change.
An exposure exception alone does not resolve this annotation requirement.

Please route this request to the plugin review team.
Please provide a case number and a written decision for both exception requests.
If an exception is unavailable, please identify the minimum required changes.
We can supply the catalog, case results, and tool-call evidence.

Thank you,
Tyler

## Evidence and references

- [Exact findings and source evidence](MCP-FINDINGS.md).
- [Eight-case report](REVIEW-CASES-2026-10-23.md).
- [Current repair and reviewer access](RESUBMISSION.md).
- [OpenAI tool exposure rule](https://developers.openai.com/plugins/plugin-guidelines#tool-independence-and-exposure).
- [OpenAI annotation rule](https://developers.openai.com/plugins/plugin-guidelines#correct-annotation).
- [Source repository](https://github.com/stellar-experimental/stellar-raven).
- [Raven product and support](https://raven.stellar.org/docs).

The plugin and saved draft IDs belong in private review correspondence when OpenAI requests them.
Keep passwords, OAuth tokens, API keys, and private account details in the secure portal fields.
Record the support case number and written decision when OpenAI responds.
