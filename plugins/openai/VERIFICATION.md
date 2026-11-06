# Draft verification: October 7, 2026

Historical record. Except for the dated October 23 summary and November 6 policy recheck below,
portal states, deployment IDs, credential status, and validation results describe October 7.
They do not establish current publication, access, or deployment state.

These checks describe the earlier submission.
On October 23, the owner supplied OpenAI's sign-in rejection.
The rejected version shows `0.1.0 · Changes required`.
The repair uploaded version `0.1.1` as a draft in the existing plugin.
Use [the resubmission record](RESUBMISSION.md) for the October 23 repair and its last recorded status.
The new reviewer account passed direct email/password sign-in and the complete MCP OAuth flow.
Initialization, tool discovery, `search`, and `execute` passed with its OAuth token.
The portal retained the new credentials and instructions after reopening the secure fields.
The owner completed the legal declarations and submitted version `0.1.2` on October 23.
That inspection recorded `In review` and `Not published`; no later portal status is established here.
Version `0.1.1` passed five cases and failed the three no-tool negative cases.
Version `0.1.2` clarified the package's unsupported actions and passed all eight repeated cases.
The [case report](REVIEW-CASES-2026-10-23.md) records both runs and the unchanged prompts.
No shared runtime, tool definition, annotation, or Claude configuration changed.

The package passed the published Agent Plugins JSON schemas.
The schema checks cover the root manifest and MCP configuration.
Separate checks cover OpenAI listing lengths, case counts, publication choices, and asset references.
These checks do not establish public review approval.

The rebuilt archive SHA-256 is `ea7317c98b011182a76b295cab3ea8eb6815ab96184d886a64642446bed92f0e`.
The root manifest and MCP configuration passed schema validation after adding the demo URL.

## Archive checks

- The archive contains one `stellar-raven/` directory and exactly three files.
- The two JSON files match the checked source files.
- The archive passes its internal CRC check.
- The archive includes the referenced 512 × 512 transparent PNG.
- The icon matches the existing repository icon byte for byte.
- The subtitle contains 26 characters.
- The three starter prompts contain 68, 95, and 65 characters.
- The review metadata contains five positive cases and three negative cases.
- The publication metadata removes country restrictions.
- The commerce declaration is false.
- The archive contains no credentials, app bindings, symlinks, or server source.

The existing repository secret scan passed.
That scan covers tracked files.
The new package files received a separate contents check.

## Live connection checks

The checks used the existing authenticated Raven connection in Codex.
They did not use a dedicated reviewer account or a saved public submission.

| Check | Result | Evidence |
| --- | --- | --- |
| Persistent storage TTL | Passed retrieval and visible explanation | Raven returned the official TTL example and storage strategy guide. |
| Lending and funding | Passed bounded retrieval and visible explanation | Scout returned Blend and Slender. Lumenloop returned their award records. |
| Passkey playbook | Passed retrieval with recovery | Raven returned the smart account playbook. A broader search found official WebAuthn references. |
| Stablecoins | Passed backend retrieval | Raven returned stablecoin rows, issuer fields, and source dates. |
| SEP-41 | Passed backend retrieval with recovery | A token-interface search returned official headings. The standards playbook supplied the official specification link. |
| Transfer request | Demonstrated capability limit | The demonstration explained the limit and made no transaction call. |
| Directory edit request | Not run | Run the negative case in the intended reviewer setup. |
| Application submission request | Not run | Run the negative case in the intended reviewer setup. |

The narrower passkey documentation search returned a soft-empty result.
The demonstration used the broader documentation search and reported that recovery.
The playbook example did not create a wallet, sign a transaction, or deploy a contract.

Run all eight complete review cases in the final reviewer setup before public submission.
Do not treat the backend checks as full case results.

## Recording

The earlier interaction demonstrated live results in chat.
It did not create a video file.
The owner identified that missing recording.
This task then recorded new live Raven calls in the actual host window.
The recording includes TTL, lending and SCF records, passkey guidance, and the unsupported transfer request.

The saved MP4 is `tmp/openai-plugin/stellar-raven-demo-2026-10-07.mp4`.
The original capture is the `.mov` file with the same name.
The MP4 contains H.264 video at 2560 × 2820 pixels.
Its duration is 120.015990 seconds and its size is 53,845,805 bytes.
The conversion preserved the captured video without re-encoding.
The full MP4 decoded without errors.
Three extracted frames showed readable text and the actual Raven interaction.
The checked frames contained no credentials or unrelated applications.
The recording has no audio.
It uses the existing authenticated connection; it does not demonstrate package installation or a dedicated reviewer account.
The owner explicitly approved a public upload to the SDF account's existing `the-dump` bucket.
The task uploaded only this recording under a new, previously unused object path.
It did not change bucket access, retention, domains, or the shared Raven Worker.
The public URL is:
https://pub-b2eaaee2bbe74d70820bacb7298958f5.r2.dev/stellar-raven/openai-review/2026-10-07/stellar-raven-demo-c0fcfd39.mp4.

The public URL returned `200 OK`, `video/mp4`, and the expected content length.
A byte-range request returned `206 Partial Content` with the correct range.
The complete public response matched the local MP4 SHA-256.
A clean browser session played the video without a login.
Seeking to 70 seconds succeeded; playback advanced to 72.002737 seconds with no media error.
One Python `urllib` probe returned `403`; browser, curl, and media-player requests succeeded.
Verify the final portal's recording-link check before submission.
The playback screenshot is `tmp/openai-plugin/public-video-playback.png`.
The package now contains this verified `review.demo_recording_url`.
User playback confirmation remains optional and pending.
The existing `r2.dev` address provides a draft review copy.
Cloudflare reserves those addresses for development use.
Use an approved custom domain if SDF requires permanent production hosting.

The MP4 SHA-256 is `c0fcfd39b7b43c12ef77dba986bafb56399d2637251dca97dea760662ee6db38`.
The recorded tool evidence is `tmp/openai-plugin/recorded-demo-tool-evidence.json`.
Earlier raw evidence remains at `tmp/openai-plugin/demo-tool-evidence.json`.
Do not upload that evidence as a substitute for the recording.

## Claude work

This task added only the separate plugin preparation files.
It did not edit the shared MCP tools, source catalog, authentication, or Claude configuration.
The current `/mcp` endpoint remains in the package.
Independent review remains outstanding.

## Exception request

The owner selected an exception request instead of a separate OpenAI endpoint.
OpenAI Support received the request and the contact email `frontier@stellar.org`.
AI support did not confirm an exception procedure or approve the two-tool contract.
This task clarified the current plugin package format and requested human review.
The chat displayed an escalation confirmation choice.
This task selected that choice; the chat then displayed "Escalation requested".
The saved transcript is `tmp/openai-plugin/support-escalation-2026-10-07.txt`.
No support case number or written exception is confirmed.
The package remains a draft.

## Approved reviewer key and portal checks

The owner approved key `openai-review-20261007` for OpenAI reviewers.
The key grants all exposed Raven MCP tools and has no automatic expiry.
The owner specified revocation after the final review decision.
The credential has file mode `0600` and stays outside the repository and ZIP.
Never copy it into these notes or the public listing.

The existing `/mcp` endpoint accepted the key through `Authorization: Bearer`.
Initialization and tool listing both returned HTTP 200.
The server listed exactly `search` and `execute`.
Search and execution checks also returned HTTP 200.
Stablecoin retrieval returned issuer accounts, organizations, source URLs, and dates.
TTL retrieval returned the official persistent storage extension example.
Lending retrieval returned Blend and Slender, followed by their SCF records.
Passkey retrieval returned the smart account playbook and official WebAuthn headings.
SEP-41 searches returned documentation headings.
A page-section lookup returned SAC content, with `complete: false`.
A later token-interface search returned the canonical documentation page.
The standards playbook identified SEP-0041 as the Soroban token interface.
It supplied `https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0041.md`.
This completed the backend evidence lookup, after recovery from heading-only results.
The evidence is `tmp/openai-plugin/reviewer-key-retrieval.json`.
These backend checks do not replace tests against the saved plugin version.
The portal's API key or custom header support remains unverified.

The portal required a verified developer identity before accepting a ZIP.
The accepted listing named SDF, but individual developer verification did not establish SDF business verification.
The owner authorized submission without waiting for the exception response.
Required portal errors still prevented submission until resolved.
The Claude MCP endpoint and server implementation were unchanged by that work.

## Policy observation

The public Raven terms describe query and response logging for 30 days.
The current operations documentation describes metadata logging for at most seven days.
A repository recheck on November 6 confirms the discrepancy remains in `src/site.ts` and
[the operations guide](../../docs/operations.md#data-retention). These statements need reconciliation
before an accurate policy attestation. This is a source check, not a fresh live-policy inspection.
This task did not change the shared runtime or published policies.

## Uploaded draft and connection

The portal accepted the prepared archive after individual developer verification.
The archive SHA-256 was `ea7317c98b011182a76b295cab3ea8eb6815ab96184d886a64642446bed92f0e`.
The owner’s private submission record identifies the existing plugin and saved version.
The saved developer name remains Stellar Development Foundation.
This does not establish SDF business verification.

The portal imported all five positive cases and all three negative cases.
The task inspected every saved prompt, scenario, and expected positive output.
The portal also retained all-country availability, the video URL, and release notes.
The portal saved all five secure reviewer-access fields.
A second inspection confirmed that each field remained populated.
The inspection withheld their contents.
The secure password field contains the approved complete named API credential.
The instructions explain direct MCP header authentication and disclose the pending exception request.
The portal's reviewer acceptance of this method remains unconfirmed.

### Domain verification service

The existing challenge URL returned HTTP 404 before this task.
The SDF account owned the existing `stellar.buzz` route zone.
The only Raven route was `raven.stellar.org/*` to `stellar-raven-codemode`.
The task created `stellar-raven-openai-verification` in the same SDF account.
The service responds only on `raven.stellar.org/.well-known/openai-apps-challenge`.
It has no secrets or service bindings and no `workers.dev` route.
Its published version is `27edfddf-6649-44a3-b8c2-177010eb2cfe`.
Its exact-path route ID is `8376ade148734b419cb2ba89c012441d`.
The service source lives outside the plugin upload directory in `plugins/openai/domain-verification/`.

The initial local build encountered a sandbox restriction on a localhost listener.
The authorized deployment build passed and published the service.
The CLI also reported an unavailable Docker daemon after successful deployment.
The published endpoint returned HTTP 200, `text/plain`, and the exact 43-byte challenge.
The response uses `Cache-Control: no-store`.
The portal confirmed `Domain verified`.

The shared Raven deployment remained unchanged at version `a4f98d3a-d7fe-4477-a203-a46054e845a5`.
Its original route ID remained `3622baa71af04ff9b6000690e0fd16f5`.
The health endpoint returned HTTP 200 after verification setup.
The before and after evidence is in `tmp/openai-plugin/domain-infrastructure-{before,after}.json`.

### OAuth and automated findings

The portal authorized the existing Raven OAuth flow.
It marked the MCP configuration `Configured` and discovered exactly `search` and `execute`.
The scan completed at 1:21:12 PM America/New_York on October 7, 2026.
The search tool received one operation-exposure finding.
The execute tool received an operation-exposure finding and a read-only annotation finding.
These match the design concerns already covered by the exception request.
The final submission form explicitly states that these findings do not block submission.
The portal still marks the MCP tab `Needs attention`.
The discovered tools are `Not live` because this draft has not been published.

The final form requires six legal declarations from the authorized developer.
They cover terms and guidelines, legal compliance, transfers, third-party rights, age suitability, and children’s data.
The Submit control is disabled until those declarations are complete.
The first declaration confirms guideline compliance.
The exception request remains pending and has no confirmed approval.
This task left the declarations for the owner and has not submitted or published the draft.

The portal's discovery check confirms the saved connection and tool definitions.
Earlier retrieval checks used the same production endpoint through the reviewer key.
They do not establish complete model behavior against the saved plugin version.

## Confirmed submission outcome

The owner replied `done` after the final legal declarations prompt.
The next inspection found that the submission form had closed.
The plugin list showed `Stellar Raven`, `Version 1.0.0 · In review`, and `Configured`.
Publication remained `Not published`.
The owner completed the final submission action in the normal Chrome browser.
This task did not make a duplicate submission or change the review state.
The package metadata version remains `0.1.0`.
The portal's displayed review version is `1.0.0`.
The three automated findings remain for review; no exception approval is confirmed.

Repository validation passed after the verification-service addition:

- `npm run typecheck` passed.
- `npm test` passed: 136 files, 2428 tests passed, and 3 expected failures.
- `npm run build` passed as a dry run.

The generated micro-map remained unchanged.
The shared Raven runtime and Claude configuration have no source changes from this task.
The independent review remains outstanding.
The reviewer key remains active for OpenAI's review.
Revoke `openai-review-20261007` after the final review decision.
Do not publish the approved release without a separate owner instruction.
