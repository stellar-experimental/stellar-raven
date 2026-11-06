# Stellar Raven resubmission: October 23, 2026

Historical record of the October 23 repair. Portal states and access checks below describe that date;
current review, publication, credential, and exception status have not been reverified here.

## Located work

The submission files are in `plugins/openai/` in the main repository checkout.
At the start of the repair, Git reported the directory as untracked.
The checkout had one worktree and one local branch, `main`.
The repair committed the preparation files on `codex/openai-review-remediation`.
A GitHub PR title search for `OpenAI` returned no matches.

Use the existing Stellar Raven plugin in the authorized owner’s portal account.
Private account and submission identifiers stay outside this repository.
The previous version shows `0.1.0 · Changes required`.
The repair uploaded version `0.1.1`, then updated the same draft to `0.1.2`.
The owner submitted version `0.1.2` on October 23, 2026.
The portal confirms `0.1.2 · In review` in the metadata version selector.
The plugin remains `Not published`.
The initial MCP tab showed unavailable connection details.
Opening its connection setup restored the production endpoint and confirmed domain verification.
The portal now shows the MCP connection as `Configured` and authentication as `Authorized`.
The dedicated reviewer account passed direct email/password sign-in in a fresh Chrome private window.
The account required no verification code, MFA, or additional setup.
The repair saved the new credentials and sign-in instructions in the secure portal fields.
Reopening those fields confirmed exact credential matches and five populated access fields.
The resubmission is complete. No publication has occurred.

The replacement archive is `tmp/openai-plugin/stellar-raven-0.1.2-draft.zip`.
Its manifest and MCP configuration passed the saved Agent Plugins 1.0.0 schemas.
Its three upload files match the source inventory, and its archive integrity check passed.
Its listing-length and review-case-count checks passed.
The repository secret scan passed for tracked files.
The upload contains no credentials and no server source.
The production `/health` endpoint returned HTTP 200 with `status: "ok"` during this repair.

## Rejection and likely cause

OpenAI reported that reviewers could not complete sign-in or OAuth.
The October 7 notes record an API key in the secure reviewer password field.
They record a successful portal OAuth connection using the owner's session.
They do not record successful reviewer sign-in through OAuth.

These records suggest a mismatch between the review instructions and the configured authentication.
They do not establish the exact error that the reviewer encountered.

The [portal authentication limits](https://developers.openai.com/plugins/deploy/submission#authentication-limitations) exclude API-key connection setup.
A fixed Raven API key does not replace the OAuth sign-in flow.
Use the dedicated Raven reviewer email and password.
The owner confirmed that the new account uses direct Raven email/password sign-in.
Reviewer credentials remain in owner-controlled private storage and the secure portal fields.

## Completed reviewer access checks

The password test used the production Raven sign-in page in the owner's actual Chrome browser.
A fresh private window excluded the owner's existing Google and Raven sessions.
Email/password sign-in returned to the Raven Playground without additional verification.

A temporary verification client then tested the complete MCP OAuth flow in that reviewer session.
The client used an authorization code, PKCE S256, and a local loopback callback.
The token exchange succeeded.
MCP initialization succeeded and tool discovery returned exactly `search` and `execute`.
The authenticated `search` request used `persistent storage TTL`.
The authenticated `execute` request returned `{"reviewerAccess":true,"arithmetic":2}`.
These checks used the reviewer OAuth token rather than an API key.
No OAuth token or password was copied into the repository or ZIP.

The portal saved the username/password sign-in method and the direct Raven login URL.
Its sign-in instructions now describe email/password authentication through OAuth.
The saved username and password matched the supplied reviewer credentials.
The portal retains all five reviewer access fields after reopening them.

The repair then ran all eight cases through fresh Codex sessions with reviewer OAuth.
Version `0.1.1` passed the five positive cases and failed the three negative cases.
The negative answers declined the actions but called retrieval tools first.
Version `0.1.2` adds explicit capability limits to the OpenAI package description.
All eight cases passed the repeated run, with no tool calls in the negative cases.
The prompts and expectations remain unchanged.
The [case report](REVIEW-CASES-2026-10-23.md) retains both runs and their limits.
Reopening the updated portal fields confirmed that the reviewer credentials remained correct.

The branch `codex/openai-review-remediation` includes the fetched `origin/main` revision `b1dc8663`.
No shared MCP runtime source, tool definition, annotation, or Claude configuration changed.

## Account preparation

Complete account registration, email verification, and password setup before review.
Ensure the account has the access needed for all eight review cases.
Verify sign-in without MFA, email codes, or access to the owner's mailbox.
Check any WorkOS account restrictions if sign-in requests additional verification.
Do not disable verification for all Raven users to repair one reviewer account.

Keep credentials outside the repository and the ZIP.
Enter credentials only in the portal's secure reviewer fields.

## Portal update

1. Open the existing Stellar Raven plugin in the authorized owner’s account.
2. Inspect the saved version before creating a replacement draft.
3. Use `Create draft from ZIP` if the rejected version has no editable review information.
4. Keep the declared endpoint `https://raven.stellar.org/mcp`.
5. Confirm that the draft retains or restores the existing MCP connection.
6. Complete OAuth setup if the portal requires it.
7. Select the username/password reviewer sign-in method if the portal offers it.
8. Replace the old reviewer username and API-key password with the dedicated account credentials.
9. Replace the direct-header instructions with the OAuth sign-in instructions below.
10. Save, reopen, and confirm that all required reviewer fields remain populated.
11. Keep credential contents out of screenshots, logs, and preparation notes.

Do not create a duplicate plugin to repair a missing connection.
Record any connection-reuse error before proceeding.
Do not change the shared server authentication merely to complete the form.

## Draft secure sign-in instructions

Start the Stellar Raven connection in ChatGPT or Codex.
Use the configured MCP endpoint: `https://raven.stellar.org/mcp`.
Review the Raven consent page and continue if you accept its terms and requested access.
At the Raven sign-in page, enter the supplied reviewer email and password.
Complete the redirect to ChatGPT or Codex.
Run the supplied review cases after the connection completes.
The reviewer account must require no registration, email code, or additional verification.

The reviewer account passed this email/password sign-in method on October 23.
The portal contains the corresponding secure instructions.

## Verification and handoff

Test a fresh sign-in through the same OAuth connection path that reviewers will use.
A Playground sign-in checks the identity provider but does not prove the complete MCP OAuth flow.
An API-key request does not test reviewer OAuth sign-in.
Confirm tool discovery and a successful `search` and `execute` request through the new connection.
Run all five positive and three negative cases against the saved draft.
Record the actual results and any failures.

The [three remaining findings](MCP-FINDINGS.md) concern tool exposure and artifact annotations.
The exception request has no confirmed approval.
The owner reconfirmed one endpoint and the exception approach on October 23.
Publisher verification and privacy-policy coverage also need the checks recorded in `README.md`.
An authentication repair does not resolve these separate items.

The owner completed the six legal declarations and the final submission action.
The form describes the existing three MCP findings as non-blocking.
It states that unresolved findings can still cause rejection.
Submission and publication are separate actions.
The current version is in review and has not been published.
The exception reply remains a draft and has not been sent.

## References

- [OpenAI reviewer access requirements](https://developers.openai.com/plugins/deploy/app-review#review-and-approval-faqs).
- [OpenAI portal authentication limits](https://developers.openai.com/plugins/deploy/submission#authentication-limitations).
- [Earlier submission evidence](VERIFICATION.md).
- [Submission package and prior decisions](README.md).
