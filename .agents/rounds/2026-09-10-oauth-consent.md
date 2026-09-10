# OAuth consent completion — 2026-09-10

## Scope and authority

Complete and review the unmerged OAuth consent and redirect change, then integrate it and clean up its branches.
The owner requested Herdr coordination, current technical research through Parallel, and UI references through Mobbin.
This work grants no production deployment or private security-report closure.

Base: `6e025e7048101a131f75fdb475146f1cbee15614`, including the local rejected-candidate retirement record.
Source commit: `db6a825eef231a01252eda7e2f0beff6bcab5b8d`.
Completion branch: `fix/oauth-consent-completion`.
The original commit applied cleanly as `700d60e`.
The private H1 report and earlier Fable signoff file are unavailable.
The current source, published standards, and new tests define the verifiable scope.

## Work ownership

| Role | Agent | Scope |
| --- | --- | --- |
| Coordination and UI | GPT-6 root | Consent presentation, browser verification, records, integration, cleanup |
| Technical research | Terra high | Primary sources through `parallel-cli`; installed provider validation |
| Auth implementation | Sol high | Redirect policy, authorization decisions, unit and assembled-worker tests |
| Independent product review | Fable high | Consent UI, accessibility, and API behavior |
| Independent technical review | Grok 4.6 high | Redirect policy, provider contracts, and authorization decisions |

Root owns worktree workspace `w3K`, its root pane `w3K:p1`, and reviewer panes split from its own pane.
Research pane: `w3G:pF`. Implementation pane: `w3G:pG`.
Product review pane: `w3G:pH`. Technical review pane: `w3G:pJ`.
Sol is the auth author, so the technical gate uses Grok for an independent vendor perspective.
Fable reviews the product changes that root authored.
No unrelated pane or workspace is controlled.

## UI design basis

The page helps an MCP client user decide whether to connect that client to Raven.
Its central information is the requesting name, its verification status, the return address, and the requested access.
Raven keeps its existing dark-green field, dithered globe, orange action, and IBM Plex typography.
The return-address panel is the new visual emphasis; the rest of the page keeps the existing hierarchy.

Existing tokens: background `#0e150d`, field `#151f14`, action `#ff5500`, text `#eef0e2`, secondary text `#9aa890`.
Display uses IBM Plex Serif. Body uses IBM Plex Sans. The complete address uses IBM Plex Mono.
The address wraps within the card and remains plain text.
The page stays script-free.

Mobbin returned five web consent references, which root visually inspected.
The [fal authorization screen](https://mobbin.com/screens/faf59377-ea96-4279-82b2-cafa51825735) places Cancel beside authorization and names the return address.
The [Laravel Cloud authorization screen](https://mobbin.com/screens/080902ea-69ea-45d6-a840-f3a6a3fdbf03) lists permissions and separates app ownership from the hosting identity.
The [Hotjar connection screen](https://mobbin.com/screens/385f310d-2707-43d8-9b41-314f2ae385a2) groups the app identity, access explanations, agreement, and Cancel action.
These references support visible identity, access, destination, and cancellation choices; they do not establish security correctness.
Raven has no app-verification program, so it must not copy a certification badge from those references.

Parallel's primary-source search also found W3C guidance for [visible keyboard focus](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)
and [reflow without horizontal reading scroll](https://www.w3.org/WAI/WCAG22/Understanding/reflow).
Browser checks covered both, plus small-screen layout and native Terms validation.
Raw UX search output: `/tmp/raven-oauth-ux-guidance.json`.

## Auth design and research

The [technical research report](2026-09-10-oauth-consent/research-terra.md) records primary sources and installed-provider behavior.
The [implementation report](2026-09-10-oauth-consent/implementation-sol.md) records the completed auth changes and focused checks.
The final response boundary enforces the transport policy on typed provider errors as well as parsed requests.
Cancel requires the consent CSRF token, clears its cookie, and returns a validated `access_denied` response.
Cancel does not require Terms acceptance or create login state.
Unknown or duplicate decisions cannot become approval.
The provider owns URI scheme validation and registered-URI matching.
This change adds no new period requirement for native schemes; the research addendum explains that policy choice.

## Browser verification

Root rendered the current consent function into local HTML with reserved example values.
The browser session was `raven-oauth-consent-20260910`; it used no running application server.
Root inspected the [desktop screenshot](2026-09-10-oauth-consent/consent-desktop.png) at 1440 CSS pixels.
Root inspected the [mobile screenshot](2026-09-10-oauth-consent/consent-mobile.png) at 320 CSS pixels.
A 402-character native return URI stayed within the mobile card without horizontal page overflow.
The full URI remained plain text and was not truncated.
The final page uses browser URL serialization, including ASCII international hostnames and encoded paths.

Native browser validation blocked approval without Terms acceptance and focused the checkbox.
Cancel submitted `decision=deny` without Terms acceptance.
The final `Sign in and connect` button submitted approval after Terms acceptance.
Keyboard navigation reached Cancel and showed its visible 2px focus outline.
The production page contains no script; the browser test added only a temporary submit recorder.

Axe 4.12.1 reported zero violations on desktop and mobile, with 34 passes per run.
The desktop incomplete contrast check covers two header labels over a gradient.
Fable computed their contrast ratios as 15.4:1 and 7.1:1, above the required thresholds.
The check does not certify all WCAG requirements or replace manual review.
The scope pill initially failed contrast at 4.28:1; its brighter text color corrected that failure.
Raw results remain in `/tmp/raven-oauth-consent-a11y-desktop.json` and `/tmp/raven-oauth-consent-a11y-mobile.json`.

## Validation and disposition

Typecheck, 2042 unit tests, 94 assembled-worker smoke tests, and the dry-run Worker build passed.
The eval self-test, routing gate, corpus lint, helper registry, improvements lint, and pin-review check passed.
All CI artifact generators ran; their committed outputs remained unchanged.
The routing gate still reports its existing protocol-history diagnostic failure; that diagnostic is outside the accepted gate.
Fable approved the final UI after reconciliation in [the product review](2026-09-10-oauth-consent/review-fable.md).
The review corrected destination serialization, approval wording, empty scopes, and the action shadow.
Normal form submission remains approval because CSRF and Terms already guard it, including keyboard submission.
The full client name remains visible because clipping removes useful identity information.
Grok found no blocking bugs in [the technical review](2026-09-10-oauth-consent/review-grok.md).
Its scheme-denylist suggestion remains outside this change because the provider owns scheme validation.
Duplicating that list would create a second policy source without a demonstrated current failure.
Cancel stays below approval because full-width controls keep clear labels and touch targets at 320 CSS pixels.
The suggested assembled-worker Cancel check now passes through registration, consent GET, and CSRF-protected denial POST.
It verifies `access_denied`, state, issuer, and cookie removal without Terms acceptance.
Root corrected the test's possibly undefined cookie split result; typecheck and all 94 smoke tests then passed.
PR [#150](https://github.com/stellar-experimental/stellar-raven/pull/150) contains the reviewed change.
GitHub CI and CodeQL passed on implementation commit `10f706f`.
The final test and review-record commit must pass GitHub checks before the merge.
Local tree and staged secret scans passed, including the gitleaks commit hook.
The retirement record is included in this PR; no unique local documentation commit needs a separate push.
After a verified squash merge, the completion and original OAuth branches can be removed.
No runtime acceptance or private-report resolution is claimed yet.

The unchanged dependency tree reports eight npm audit findings: one moderate and seven high.
These findings concern indirect Hono and tooling dependencies; this change updates no packages.
The research report records the dependency boundary.
