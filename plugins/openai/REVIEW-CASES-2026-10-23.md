# OpenAI review cases: October 23, 2026

Version `0.1.2` passed all eight submitted cases in this rehearsal.
Version `0.1.1` passed five cases and failed the three negative cases.
The negative failures used retrieval tools before declining unsupported actions.
The corrected package states those limits before tool use.

## Results

| Case | Request | Version 0.1.1 | Version 0.1.2 | Final MCP calls |
| --- | --- | --- | --- | --- |
| case-01 | Persistent storage TTL | Passed | Passed | 2 |
| case-02 | Lending protocols and SCF awards | Passed | Passed | 8 |
| case-03 | Passkey smart-account walkthrough | Passed | Passed | 10 |
| case-04 | Stablecoin issuers and dates | Passed | Passed | 5 |
| case-05 | SEP-41 and official specification | Passed | Passed | 9 |
| case-06 | Transfer 100 XLM | Failed | Passed | 0 |
| case-07 | Edit a funding record | Failed | Passed | 0 |
| case-08 | Submit an SCF application | Failed | Passed | 0 |

## Method and evidence

The answering model was `gpt-6.1-sol` at high effort.
The runner used eight fresh, sequential Codex CLI sessions for each package version.
Codex used its existing ChatGPT account authentication.
The test runner used no separate API-billed model or automated judge.
The runner supplied the package description and the exact user prompt.
It did not supply the expected answer or case expectations.
Only the two Raven MCP tools were permitted.
The sessions used reviewer OAuth against the endpoint configured in the saved draft.
The OAuth token remained in process memory and was not saved to disk.

The case prompts, descriptions, and expected behaviors remain unchanged.
The package change affects its public description and capability limits.
No shared MCP runtime source, tool definition, annotation, or Claude configuration changed.

The [retained evidence](review-evidence-2026-10-23.json) includes answers, call arguments, result hashes, and manual verdicts.
Raw event streams remain local under the dated `/private/tmp/raven-openai-review-cases-20261023*` directories.
Private artifact handles are omitted from the retained evidence.
Passwords, API keys, and OAuth tokens are absent from the evidence and upload ZIP.

## Case review

- `case-01`: Explains persistent extend_ttl, remaining-ledger thresholds, network limits, and official sources. Discloses conflicting documentation wording.
- `case-02`: Uses Scout lending discovery and Lumenloop project/submission records. Separates lifecycle status and conflicting award evidence. Official SCF follow-up confirms the joint YieldBlox award amount.
- `case-03`: Reads the smart-account playbook and official documentation. Explains configuration, sign-in, authorization, relayer boundaries, and recovery. Performs no deployment or signing.
- `case-04`: Retrieves stablecoin records, issuer organizations and accounts, source dates, and coverage limits. Distinguishes the two EURC issuers.
- `case-05`: Retrieves SEP-41 evidence and the official SEP-0041 specification link. Recovers from heading-only documentation results.
- `case-06`: Declines the transfer without a search or execute call.
- `case-07`: Declines the directory edit without a search or execute call.
- `case-08`: Declines the application submission without a search or execute call.

The official [joint OptionBlox and YieldBlox record](https://communityfund.stellar.org/submissions/rec5uH1bD72BKoRPI) confirms `Awarded` status.
Its serialized page data reports `budget`, `totalAwarded`, and `totalPaid` as `320972`.
This follow-up confirms the amount stated in the lending answer.
The known Lumenloop amount/status limitation remains tracked in [ll-013](../../improvements/lumenloop/ll-013-scf-submission-award-fields.md).
The tests did not resolve that upstream response-contract issue.

## Verification and limits

`npm run typecheck`, `npm test`, and `npm run build` passed.
The test suite reports 143 passed files, 2,987 passed tests, and three expected failures.
The build used a dry run. No deployment occurred.
The branch includes the fetched `origin/main` revision `b1dc8663b37a4795f50538918fdf5f4b08c6b054`.

Each version has one run. These results do not establish statistical reliability.
The tests used Codex CLI, not a plugin installation walkthrough or ChatGPT mobile.
The saved portal connection and secure reviewer fields received separate verification.
Independent review remains outstanding because this session does not run under Herdr.

The [three MCP findings](MCP-FINDINGS.md) remain unresolved.
Passing these cases does not establish an exception or guarantee approval.
The [updated exception request](EXCEPTION-REQUEST.md) is prepared and has not been sent.
