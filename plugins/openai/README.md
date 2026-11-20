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

- **Tool exposure:** [OpenAI's guidelines](https://developers.openai.com/plugins/plugin-guidelines#tool-independence-and-exposure) expect one reviewable tool per callable operation, conflicting with Raven's `search` + `execute` design. The owner chose an exception request and authorized submitting the existing design while it is pending (resolve required portal errors first).
- **Annotations:** `execute` can persist large results for seven days, conflicting with `readOnlyHint: true` under OpenAI's artifact persistence rule (cannot be overridden in the ZIP). Assess `openWorldHint` against actual retrieval scope.
- **Authentication:** OAuth resource and scope checks may be reviewed; keep the shared Claude contract unchanged without a separate reviewed change.
- **Privacy:** `/terms` still states 30-day query/response logging while [operations](../../docs/operations.md#data-retention) states at most 7-day metadata retention ([recorded check](VERIFICATION.md#policy-observation)). Resolve this and confirm third-party source terms before publication.

## Review materials

- **Reviewer access:** the portal does not support API-key setup. Reviewers use a dedicated Raven OAuth account (email + password stored in the portal's secure fields; no MFA, email codes, or owner-mailbox access). Never weaken verification for all Raven users to fix one reviewer account. Check the portal before acting (last checked 2026-10-23).
- **Demo recording:** `review.demo_recording_url` points to the [verified recording](https://pub-b2eaaee2bbe74d70820bacb7298958f5.r2.dev/stellar-raven/openai-review/2026-10-07/stellar-raven-demo-c0fcfd39.mp4) (shows the authenticated connection, not install/sign-in). [`r2.dev` is dev-only](https://developers.cloudflare.com/r2/buckets/public-buckets/); move to an SDF-approved domain if permanent hosting is needed.

### Portal update

1. Inspect the existing saved Stellar Raven plugin before creating a replacement draft.
2. If the rejected version has no editable review fields, use `Create draft from ZIP`, keep `https://raven.stellar.org/mcp`, and confirm the draft retains/restores the existing MCP connection (never create a duplicate plugin).
3. Complete OAuth setup if required, select username/password reviewer sign-in, and enter the dedicated reviewer credentials and sign-in instructions below.
4. Save, reopen, and verify all required reviewer fields persist. Keep credentials out of screenshots, logs, and notes.

Sign-in instructions for the portal field:

> Start the Stellar Raven connection in ChatGPT or Codex. Use the configured MCP endpoint:
> `https://raven.stellar.org/mcp`. Review the Raven consent page and continue if you accept its
> terms and requested access. At the Raven sign-in page, enter the supplied reviewer email and
> password. Complete the redirect to ChatGPT or Codex. Run the supplied review cases after the
> connection completes. The reviewer account must require no registration, email code, or
> additional verification.

### Demo recording

Connect and sign in via ChatGPT or Codex, then record all four prompts (screenshots or scripts do not count): persistent storage TTL (tool result + official link), lending/SCF (source records + submissions vs awards), passkey (retrieved playbook + links), and transfer (capability limit, no tool call). Verify playback and absence of credentials, host publicly without login, update `review.demo_recording_url`, and rebuild the ZIP.

## Build the draft archive

From the repository root:

```sh
mkdir -p tmp/openai-plugin
cd plugins/openai
zip -X -r ../../tmp/openai-plugin/stellar-raven-0.1.2-draft.zip stellar-raven
```

Verify the ZIP contains only `stellar-raven/` with the declared files (no review notes or evidence).

## References

- [Package and submission](https://developers.openai.com/plugins/deploy/submission), [plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines), [MCP review](https://developers.openai.com/plugins/deploy/app-review)
- [Raven support](https://raven.stellar.org/docs), [Raven terms](https://raven.stellar.org/terms), [SDF privacy policy](https://stellar.org/privacy-policy)
