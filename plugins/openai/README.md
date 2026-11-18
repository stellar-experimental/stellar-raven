# Stellar Raven OpenAI plugin

A separate OpenAI plugin package that connects to the existing production server. It does not
change the Claude connection or the server.

**Status.** Portal state and the open work are in [the work queue](../../.agents/TODO.md) under
"OpenAI plugin submission"; the last recorded state is in [RESUBMISSION.md](RESUBMISSION.md).
Check the portal, reviewer access, and any exception decision before you act.

| File | Kind | Holds |
|---|---|---|
| [RESUBMISSION.md](RESUBMISSION.md) | Dated record | The October 23 repair and the last recorded status |
| [REVIEW-CASES-2026-10-23.md](REVIEW-CASES-2026-10-23.md) | Dated record | The eight-case rehearsal: first failures and the verified package fix |
| [MCP-FINDINGS.md](MCP-FINDINGS.md) | Dated record | The three portal findings that need OpenAI's exception decision |
| [EXCEPTION-REQUEST.md](EXCEPTION-REQUEST.md) | Dated record, unsent draft | The request for written guidance on the single-endpoint design |
| [VERIFICATION.md](VERIFICATION.md) | Dated record | The October 7 submission: portal state, reviewer key, recording, and policy observation |
| [domain-verification/](domain-verification/) | Living guide | The Worker that serves the domain challenge |

No record is an instruction. The standing procedure is in "Review materials" below.

## Rules

- Preserve the `/mcp` endpoint and its Claude contract. Do not put an unverified endpoint in
  `mcp.json`, and do not deploy a change to the shared server only to complete this package.
- Do not describe an exception as approved without OpenAI's written decision.
- Credentials stay in the portal's secure reviewer fields, never in the ZIP or the repository.
  Private account and submission identifiers stay outside the repository.
- Publishing needs a separate owner instruction after approval.

## Package

- `stellar-raven/plugin.json`: the listing, the publication choices, and eight review cases
  (five positive, three negative, built from the three Claude example prompts). They describe the
  current `search` and `execute` tools; revise the tool expectations if the server changes.
- `stellar-raven/mcp.json`: the verified Streamable HTTP endpoint.
- `stellar-raven/assets/raven-icon-512.png`: a copy of the Raven icon.

The package holds no bundled skill, app binding, credential, or server source.

Publication choices, set by the owner and recorded in [VERIFICATION.md](VERIFICATION.md): publisher Stellar Development
Foundation, all available countries (`publication.countries: []`), no payments or purchases, and
the existing Raven icon and orange. The portal must confirm the verified publisher before
submission; the package does not prove business verification.

## Open review requirements

- **Tool exposure.** [OpenAI's guidelines](https://developers.openai.com/plugins/plugin-guidelines#tool-independence-and-exposure)
  require a separate reviewable tool for each callable operation. Raven's discovery tool and
  generic executor conflict with that, and a ZIP cannot change it. The owner chose an exception
  request and authorized submission while it is pending. Submit the existing design if the portal
  permits review with findings, and resolve required portal errors first.
- **Annotations.** `execute` can persist a large result for seven days, which conflicts with its
  `readOnlyHint: true` under OpenAI's artifact persistence rule. The package cannot override MCP
  tool annotations. Assess `openWorldHint` against the tool's actual retrieval scope.
- **Authentication.** OAuth resource and scope checks may be reviewed.
  Do not replace the shared Claude authentication contract without a separate reviewed change.
- **Privacy.** The package keeps the existing privacy URL, which does not prove full coverage of
  stored results, upstream recipients, and usage records. `/terms` still describes
  query/response logging for 30 days, while
  [operations](../../docs/operations.md#data-retention) describes operational metadata retention
  of at most seven days ([recorded check](VERIFICATION.md#policy-observation)). Resolve this
  before publication, and confirm the authorization and terms of the independently operated
  sources.

## Review materials

- **Reviewer access.** The portal does not support API-key connection setup. Reviewers use the
  dedicated Raven reviewer account through the normal OAuth sign-in; the portal stores its email
  and password. The October 23 check needed no MFA, email code, or further setup. The procedure
  below was last run on 2026-10-23; check the portal before you act.
- **Demo recording.** The package's `review.demo_recording_url` points at the
  [verified recording](https://pub-b2eaaee2bbe74d70820bacb7298958f5.r2.dev/stellar-raven/openai-review/2026-10-07/stellar-raven-demo-c0fcfd39.mp4).
  It shows the authenticated Raven connection, not package installation or reviewer sign-in.
  [Cloudflare reserves `r2.dev` URLs for development use](https://developers.cloudflare.com/r2/buckets/public-buckets/);
  use an SDF-approved custom domain if permanent hosting is required.

### Reviewer access procedure

Account preparation:

- Complete registration, email verification, and password setup before review. Ensure the account
  can run all eight review cases.
- Verify sign-in without MFA, email codes, or access to the owner's mailbox. Check any WorkOS
  account restrictions if sign-in asks for more verification. Do not disable verification for all
  Raven users to repair one reviewer account.
- Keep credentials outside the repository and the ZIP. Enter them only in the portal's secure
  reviewer fields.

Portal update:

1. Open the existing Stellar Raven plugin in the authorized owner's account, and inspect the saved
   version before you create a replacement draft.
2. Use `Create draft from ZIP` if the rejected version has no editable review information. Keep the
   declared endpoint `https://raven.stellar.org/mcp`, and confirm that the draft retains or
   restores the existing MCP connection. Do not create a duplicate plugin to repair a missing
   connection, and record any connection-reuse error.
3. Complete OAuth setup if the portal requires it. Select the username/password reviewer sign-in
   method if the portal offers it.
4. Replace the old reviewer credentials and the direct-header instructions with the dedicated
   account's credentials and the sign-in instructions below.
5. Save, reopen, and confirm that every required reviewer field remains populated. Keep
   credential contents out of screenshots, logs, and preparation notes.

Do not change the shared server authentication merely to complete the form.

Sign-in instructions for the portal field:

> Start the Stellar Raven connection in ChatGPT or Codex. Use the configured MCP endpoint:
> `https://raven.stellar.org/mcp`. Review the Raven consent page and continue if you accept its
> terms and requested access. At the Raven sign-in page, enter the supplied reviewer email and
> password. Complete the redirect to ChatGPT or Codex. Run the supplied review cases after the
> connection completes. The reviewer account must require no registration, email code, or
> additional verification.

### Demo recording

To record a new demonstration:

1. Connect the packaged version in ChatGPT or Codex, sign in, then start a screen recorder.
2. Ask the persistent storage TTL prompt. Show the tool result, the explanation, and the official
   source link.
3. Ask the lending and SCF prompt. Show the source records and the distinction between
   submissions and awards.
4. Ask the passkey prompt. Show the retrieved playbook and reference links.
5. Ask the transfer prompt. Show the capability limit with no tool call.
6. Play the saved recording. Check readable text, working playback, and the absence of
   credentials or private account content.
7. Host it where a reviewer can play it without a private login, and verify that.
8. Put the verified URL in `review.demo_recording_url` and rebuild the ZIP.

Screenshots or a recording script do not count as the recording.

## Build the draft archive

From the repository root:

```sh
mkdir -p tmp/openai-plugin
cd plugins/openai
zip -X -r ../../tmp/openai-plugin/stellar-raven-0.1.2-draft.zip stellar-raven
```

Inspect the archive after each change. It must contain one `stellar-raven/` directory with the
declared files. Keep review evidence and preparation notes outside the upload directory.

## References

- [Package and submission](https://developers.openai.com/plugins/deploy/submission),
  [plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines), and
  [MCP review](https://developers.openai.com/plugins/deploy/app-review).
- [Raven support](https://raven.stellar.org/docs), [Raven terms](https://raven.stellar.org/terms),
  and the [published SDF privacy policy](https://stellar.org/privacy-policy).
