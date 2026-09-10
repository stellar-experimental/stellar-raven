# Fable UI/API review — OAuth consent page

Reviewer: Fable high, independent of the GPT-6 UI author and the Sol auth author.
Date: 2026-09-10. Scope: `src/site.ts` consent changes against `6e025e7` and `db6a825`,
`test/consent-page.test.ts`, the consent handler contract in `src/auth/workos.ts`,
`ARCHITECTURE.md`, and the round ledger. Transport rules and CSRF Cancel are Sol-owned and not re-tested here.

## Initial verdict

Approve after one fix (F1), a spoofing gap in the destination disclosure. F2–F6 were low.

## Findings

**F1 (medium) — Return address showed the raw string, not the URL the browser will visit.**
The first revision rendered `args.redirectDestination` verbatim. The provider builds the real redirect
with `new URL(options.request.redirectUri)` (`oauth-provider.js:3628,3663`), which percent-encodes
non-ASCII path and query bytes and converts the host to punycode. A raw string can therefore look
different from the destination the browser will open. Two classes matter: Unicode bidirectional control
characters inside a path can reorder the visible text, and an internationalised hostname can resemble a
different Latin hostname. `dir="ltr"` and `unicode-bidi:isolate` protect the surrounding page but not
text inside the string. Recommended fix: display `new URL(redirectUri).href`, which normalises both
classes while leaving custom schemes and loopback addresses unchanged, plus a unit case.

**F2 (low) — Approval is implicit.** The server treats a submission with no `decision` field as
approve. Suggested `decision=approve` for a self-describing wire contract. CSRF and `tos_agree` already
gate approval, so this is API hygiene, not a security gap.

**F3 (low) — Primary label under-stated the grant.** "Continue to sign in" read as a step before a
later approval, but `/callback` completes authorization with no second prompt.

**F4 (low, pre-existing) — Empty scope rendered as a granted pill** with a tick under "This connection grants".

**F5 (low) — No display cap on client name.** A 146-character unbroken name wraps correctly
(`scrollWidth` 320) but pushes the qualifier and address below the fold.

**F6 (nit) — Primary button glow bled into the Cancel border.**

## Verified

- Identity: `<bdi>` name in h1, `.unverified` qualifier beneath, `aria-hidden` avatar. Always-on
  qualifier is correct for DCR/CIMD (RFC 7591 §5); no certification badge copied from Mobbin references.
- Destination: complete, plain text, no link; 402-char and 150-char addresses fit 320px without overflow.
- Terms: `required` checkbox, `formnovalidate` on Cancel, approve is the first submit button so Enter
  cannot bypass. Server still rejects missing `tos_agree`. The mouse-only `:has()` gate is gone.
- Script-free: no `<script>`; test asserts it. Cancel is a real submit inside the CSRF form.
- Accessibility: landmarks, h1→h2→h2 order, `aria-labelledby` on the destination, 46px Cancel,
  label-wrapped checkbox, `:focus-visible` fog outline overriding the base rule by specificity.
- Contrast (computed WCAG): header fog/stage 15.4, header dim/stage 7.1 (resolves the two axe
  "incomplete" checks), dim/card 6.3, dim/destination 6.9, `--orange-2` scope text 5.3 (old `--orange` was 4.3),
  button text 6.1.
- ARCHITECTURE.md matches the handler behaviour.

## Reconciliation (revised `src/site.ts` and `test/consent-page.test.ts`)

- **F1 fixed.** `consentPage` now renders `new URL(args.redirectDestination).href`. The new test
  asserts a benign international hostname and path serialise to punycode and percent-encoding. The
  long native-scheme test still passes, so custom schemes are unchanged. The constructor cannot throw
  on the live path: `hasAllowedRedirectTransport` in `src/auth/redirects.ts` already parses the same
  string and returns a local 400 on failure before the page renders. Client-name bidi controls are not
  stripped; that is acceptable because `<bdi>` isolates the name and the qualifier declares it untrusted.
- **F2 accepted as-is.** Root's reasoning holds: a normal submission, including Enter, is the approve
  action, the server rejects any unknown or duplicate `decision`, and CSRF plus Terms gate the grant.
- **F3 fixed.** "Sign in and connect"; test updated.
- **F4 fixed.** Empty request renders `<p class="scope-empty">No scopes requested.</p>`; no pill, no
  tick; test asserts it; 380px padding rule includes `.scope-empty`.
- **F5 accepted as-is.** Wrapping preserves the full disclosure with no overflow. Clipping would remove
  identity information, which matters more than fold position.
- **F6 fixed.** `.act .btn-primary` sets `box-shadow:none`.

`test/consent-page.test.ts` passes 5/5. No source edits by this reviewer.

## Final verdict

**Approve.** All medium findings are resolved and the two retained dispositions are sound.

## Evidence

- `git diff 6e025e7 -- src/site.ts`; `src/auth/workos.ts:159-235`; `src/auth/redirects.ts`.
- `consent-{desktop,mobile}.png` in this directory; isolated 320px renders via agent-browser session
  `fable-consent-review` (closed); Node 24 `new URL(...).href` serialisation checks.
