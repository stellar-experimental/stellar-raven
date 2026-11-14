# Stellar Raven OpenAI plugin

A separate OpenAI plugin package that connects to the existing production server. It does not
change the Claude connection or the server.

**Status.** The last recorded portal state (October 23, 2026) is version `0.1.2`, in review and
not published. Check the portal, reviewer access, and any exception decision again before you
act. The open work is in [the work queue](../../.agents/TODO.md) under "OpenAI plugin
submission".

| Record | Holds |
|---|---|
| [RESUBMISSION.md](RESUBMISSION.md) | The October 23 repair, the reviewer-access procedure, and the last recorded status |
| [REVIEW-CASES-2026-10-23.md](REVIEW-CASES-2026-10-23.md) | The eight-case rehearsal: first failures and the verified package fix |
| [MCP-FINDINGS.md](MCP-FINDINGS.md) | The three portal findings that need OpenAI's exception decision |
| [EXCEPTION-REQUEST.md](EXCEPTION-REQUEST.md) | The request for written guidance on the single-endpoint design |
| [VERIFICATION.md](VERIFICATION.md) | The October 7 submission: portal state, reviewer key, recording, and policy observation |
| [domain-verification/](domain-verification/) | The Worker that serves the domain challenge |

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

Publication choices, confirmed by the owner on October 7, 2026: publisher Stellar Development
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
- **Authentication.** The earlier OpenAI audit named OAuth resource and scope checks for review.
  Do not replace the shared Claude authentication contract without a separate reviewed change.
- **Privacy.** The package keeps the existing privacy URL, which does not prove full coverage of
  stored results, upstream recipients, and usage records. `/terms` still describes
  query/response logging for 30 days, while
  [operations](../../docs/operations.md#data-retention) describes operational metadata retention
  of at most seven days ([policy observation](VERIFICATION.md#policy-observation)). Resolve this
  before publication, and confirm the authorization and terms of the independently operated
  sources.

## Review materials

- **Reviewer access.** The portal does not support API-key connection setup. Reviewers use the
  dedicated Raven reviewer account through the normal OAuth sign-in; the portal stores its email
  and password. The October 23 check needed no MFA, email code, or further setup.
- **Demo recording.** The package's `review.demo_recording_url` points at the
  [verified recording](https://pub-b2eaaee2bbe74d70820bacb7298958f5.r2.dev/stellar-raven/openai-review/2026-10-07/stellar-raven-demo-c0fcfd39.mp4).
  It shows the authenticated Raven connection, not package installation or reviewer sign-in.
  [Cloudflare reserves `r2.dev` URLs for development use](https://developers.cloudflare.com/r2/buckets/public-buckets/);
  use an SDF-approved custom domain if permanent hosting is required.

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
- The Claude listing work this package builds on: commits `65f38b83` (execute scope and
  result-storage description), `aa004d7d` (source operator credits), `8c0e6ee2` (hosted icon and
  logos), and `dd8724e5` (hosted brand and listing images).
