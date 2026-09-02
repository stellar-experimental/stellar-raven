# Protocol-history frozen controls — independent blind label review

Reviewer: Grok in this worktree.
Date: 2026-09-02.
Scope: frozen protocol-history controls.
Target operation: `scout.searchResearch`.

This review does not change contracts, labels, code, or generated files.
This review does not change `TODO.md` or `NEXT.md`.

## 1. Methods

I read `AGENTS.md` in full.
I read `.agents/skills/run-evals/SKILL.md` in full.
I then read only these inputs:

- `eval/protocol-history-cases.json`
- `eval/protocol-history-blind-cases.json`
- `inventory/stellar-light.json` for `GET /api/research` `x-routing`
- `catalog/manifest.json` for `scout.searchResearch`

I did not read a 2026-09-02 protocol-history ledger.
I did not read another worker report.
I did not call a provider, a model, a network service, or a paid operation.
I did not run routing.
I did not execute `search` or `execute`.

An untracked file named `.agents/rounds/2026-09-02-protocol-history-free-evidence.md` was present in `git status`.
I did not open that file.

### Decision test

The frozen contracts say this:

- Positive cases require `scout.searchResearch` in the top five.
- Control cases forbid `scout.searchResearch` anywhere in the top five.

This review answers one question for every control:

Does `scout.searchResearch` belong in the top five under the target card `useWhen` and `notFor`?

I use inventory `x-routing.useWhen` and `x-routing.notFor` as the primary test.
I use the OpenAPI description, the `source` filter text, and the catalog note as supporting card text.
The catalog entry has no `useWhen` field and no `notFor` field.

I check positive labels only for symmetry and leakage.
I do not relabel a positive in this review.

### Verdict words

- **VALID CONTROL.** `scout.searchResearch` does not belong in the top five.
- **DISPUTED CONTROL.** `scout.searchResearch` belongs in the top five.
- **LEAKAGE.** The control label can stay, but card text overlaps a positive or a keyword.

A control is in scope when `useWhen` or the same-card `source` filter names the asked work, and `notFor` does not exclude it.
A control is out of scope when the user debugs, reports, or writes about their own work, or asks for a live current value that `useWhen` does not name.

## 2. Exact inputs and hashes

Worktree branch: `research/protocol-history-free-evidence`.
HEAD: `3428631151418e6cea380316c2387cbc6bc731ff`.
HEAD subject: `Guard paid agent-discovery runs (#116)`.
HEAD date: `2026-09-01T23:04:10-04:00`.

Hash method: SHA-256 of the file bytes.
Digest method: `sha256(JSON.stringify({positiveCases,controlCases}))` in Node.js, same as `eval/self-test.mjs`.

| Path | Bytes | SHA-256 |
|---|---:|---|
| `eval/protocol-history-cases.json` | 3418 | `df8218e1b3a5a1526859c4c33d9b565cfd23f38b9c835d22fd93322c8e5c8857` |
| `eval/protocol-history-blind-cases.json` | 4311 | `843aaa70c20eebe29d222a9f7e585a8ab6e722b88396b01c75079008d56446b3` |
| `inventory/stellar-light.json` | 476799 | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0` |
| `catalog/manifest.json` | 750511 | `4945c3117d464d7155fe6bc2bd2f2f42638ef83159435ae48a90bab046dc6789` |

| Contract | Name | Authored | Frozen | Positives | Controls | Recomputed digest | Stated digest match |
|---|---|---|---|---:|---:|---|---|
| `eval/protocol-history-cases.json` | `protocol-history-routing-v1` | 2026-08-30 | true | 8 | 4 | `5b8ee40f89c846c4e69fa91f5a483f9d224dd79628afa7f9ac45b522f9aaa8a8` | yes |
| `eval/protocol-history-blind-cases.json` | `protocol-history-blind-v1` | 2026-08-30 | true | 11 | 9 | `b63cfb605bd98aeba6981535be7bd5ee968e1e8b48ee92a1d55e4d5b07521f53` | yes |

Inventory pin: `fetchedAt=2026-08-28T12:50:57.417Z`, `changelogLatest.version=spec@1.9.1`.
Catalog pin: `generatedAt=2026-08-28T12:51:01Z`, `version=1`, 252 entries.
Catalog provenance for `scout.searchResearch`: `openapiVersion=1.9.1`, `fetchedAt=2026-08-28T12:50:57.417Z`.
Transport: `GET https://stellarlight.xyz/api/research`.

| Card slice | SHA-256 |
|---|---|
| Inventory `x-routing` JSON | `468a9d9834e8cb50cb905f80ccc42f9d3daa7a3d0ff2d8c5194d566812ba716b` |
| Inventory OpenAPI description | `b583aa05858240897ed72a922c61555763244ce76367dc3f86e73c268861a5bd` |
| Inventory `source` parameter description | `dbb1b6d8f94d511877a7f167f3cf530173a9320c648aac33edd450613ae1e671` |
| Catalog `scout.searchResearch` description | `80157277b8d9c834b1b3cc5a6aeab8ec89dea5ed2d449b434d8064cd4c798e43` |
| Catalog entry slice (`id`, description, `routingKeywords`, source, transport, provenance) | `0eab577f655256fe5e6469fce0e176ac8a073f06b031bf693de734f923947c8f` |

`x-routing` counts: 9 `useWhen` lines, 2 `notFor` lines, 6 example questions, 91 keywords.
Catalog `routingKeywords` count: 176.

## 3. Target card text used in the test

### 3.1 `notFor`

The inventory card `notFor` list is only these two lines:

```
what products exist or their funding/status -> searchProjects
GitHub source code ranked by quality -> searchRepos
```

No control in this set asks for a product roster or a ranked GitHub search.
`notFor` therefore excludes none of the 13 controls.

### 3.2 `useWhen` lines that decide controls

These `useWhen` lines are the load-bearing ones for this set:

```
'how does X work', 'is X possible / has X been discussed on Stellar', 'what does the SEP/spec/audit say about X'
```

```
primary-source citations for a thesis or design question; ecosystem KNOWLEDGE & explainer questions ('what is / how does / who / why / is it true that…')
```

```
security & risk (audits, exploits, incidents, post-mortems, oracle manipulation), bug-bounty / disclosure program status (source=security-program: which program is current, HackerOne vs Immunefi, where to report), compliance & regulation (Travel Rule, FATF, KYC/AML, sanctions)
```

```
SDF org/mission/legal structure; protocol history (SCP whitepaper, authors); ecosystem programs (ambassadors, regional chapters, bootcamps)
```

```
Soroban security incidents (reentrancy, sdk advisories/CVEs, DoS); ecosystem history (Protocol 20 mainnet launch, XLM initial supply, UNHCR aid, Enterprise Fund)
```

### 3.3 Supporting card text

OpenAPI description:

```
THE surface for 'how does X work', 'what does the SEP/spec/audit say', and how-to/feasibility questions.
```

`source` filter text:

```
Use 'audit' for security questions, 'incident' for exploit/post-mortem history, ... 'paper' for foundational protocol questions, 'release' for stellar-core/CLI/SDK release notes (what shipped, when — protocol upgrade tags).
```

The `source` enum includes `sep`, `cap`, `dev-docs`, `audit`, `incident`, and `release`.

Catalog note on `scout.searchResearch`:

```
this is the broad Scout cited-research recovery lane for history, standards, incidents, audits, and unknown technical topics.
```

Schema field `capProtocolVersion` on research rows:

```
the join key between protocol history and soroban-sdk versions.
```

## 4. Per-control verdicts

There are 13 controls.
Four original controls come from `protocol-history-routing-v1`.
Nine blind controls come from `protocol-history-blind-v1`.

### 4.1 `ph-control-current-protocol` — VALID CONTROL, with leakage

Class: `direct-current-lookup`.
Question: `What is the current Stellar Mainnet protocol version?`

`useWhen` names protocol history and Protocol 20 launch.
It does not name a live current Mainnet version.
The word `current` in `useWhen` is only for the security program:

```
which program is current, HackerOne vs Immunefi, where to report
```

`notFor` does not apply.

Verdict: `scout.searchResearch` does not belong in the top five.
The question asks for a live current value.
The card asks for cited history, not live protocol status.

Leakage: catalog `routingKeywords` include `current`, `protocol`, `mainnet`, and `20`.
The `source=release` text names protocol upgrade tags.
A ranker can still place this card in the top five.

### 4.2 `ph-control-validator-vote` — DISPUTED CONTROL

Class: `direct-process-lookup`.
Question: `How do Stellar validators vote to activate a protocol upgrade?`

Matching `useWhen` text:

```
'how does X work'
```

```
ecosystem KNOWLEDGE & explainer questions ('what is / how does / who / why / is it true that…')
```

`notFor` does not apply.

This is a how-does-X-work explainer.
The card assigns that work to `scout.searchResearch`.
Top five can include other docs cards.
This card still belongs in the top five.

Verdict: the forbid-top-five label is not valid.

### 4.3 `ph-control-soroban-deploy` — VALID CONTROL, with leakage

Class: `implementation`.
Question: `How do I build and deploy a Soroban contract to Testnet?`

No `useWhen` line names contract build or deploy.
The SCF how-to line is about awards, not deploy:

```
how to apply step-by-step, Build/Instawards/Liquidity/Public-Goods awards
```

`notFor` does not apply.

The OpenAPI description still claims how-to:

```
THE surface for 'how does X work', 'what does the SEP/spec/audit say', and how-to/feasibility questions.
```

The catalog note also claims unknown technical topics.

Verdict: under `useWhen` and `notFor`, `scout.searchResearch` does not belong in the top five.
The residual risk is the how-to sentence in the description.

### 4.4 `ph-control-clawback-cap` — DISPUTED CONTROL

Class: `direct-spec-lookup`.
Question: `Which CAP and protocol version introduced clawback?`

Matching `useWhen` text:

```
'what does the SEP/spec/audit say about X'
```

Supporting `source` text includes `cap` and `release`.
Supporting schema text calls `capProtocolVersion` the join key between protocol history and SDK versions.
`notFor` does not apply.

This is a spec lookup.
The card assigns spec lookup to this operation.

Verdict: `scout.searchResearch` belongs in the top five.
The forbid-top-five label is not valid.

Symmetry: this control is a narrow form of two positives. See section 6.

### 4.5 `phb-control-protocol-xdr-bug` — VALID CONTROL

Class: `implementation-debugging`.
Question: `I found a bug in the protocol XDR encoding for muxed accounts.`

The user reports a bug in their work.
`useWhen` names cited incidents, audits, and explainers.
It does not name live bug filing or live debugging.

`notFor` does not apply.

Verdict: `scout.searchResearch` does not belong in the top five.

Leakage: keywords include `bug` and `protocol`.

### 4.6 `phb-control-contract-fail-after-upgrade` — VALID CONTROL, with leakage

Class: `implementation-debugging`.
Question: `Why does my contract fail after a protocol upgrade?`

The subject is `my contract`.
That is first-person debugging.
`useWhen` why-explainers are ecosystem knowledge, not a local fail.

`notFor` does not apply.

Verdict: `scout.searchResearch` does not belong in the top five.

Leakage: `why` plus `protocol upgrade` overlaps these positives:

- `ph-protocol-24-archival-root-cause`
- `phb-second-cut-after-whisk`

### 4.7 `phb-control-incident-runbook` — VALID CONTROL, with leakage

Class: `operations-guidance`.
Question: `How do I write an incident response runbook for validators?`

The user asks to write a runbook.
`useWhen` names retrieval of incidents and post-mortems, not runbook authorship.

Matching retrieval text, which this question does not ask:

```
security & risk (audits, exploits, incidents, post-mortems, oracle manipulation)
```

`notFor` does not apply.

Verdict: `scout.searchResearch` does not belong in the top five.

Leakage: the token `incident` is on the card and on the positives.

### 4.8 `phb-control-contract-exploit-review` — VALID CONTROL, with leakage

Class: `code-review`.
Question: `Show me the exploit in this Soroban contract I am reviewing.`

The object is `this Soroban contract I am reviewing`.
That is user code under review.
`useWhen` names corpus incidents and exploits, not a private review.

Matching corpus text:

```
Soroban security incidents (reentrancy, sdk advisories/CVEs, DoS)
```

```
security & risk (audits, exploits, incidents, post-mortems, oracle manipulation)
```

`notFor` does not apply.

Verdict: `scout.searchResearch` does not belong in the top five.
The first-person object keeps it out of scope.

Leakage is high.
The words `exploit` and `Soroban` sit on the card.

### 4.9 `phb-control-sdk-version-history` — DISPUTED CONTROL

Class: `sdk-reference`.
Question: `What is the version history of the JavaScript SDK?`

`useWhen` names protocol history and Protocol 20.
It does not name SDK version history.
`notFor` does not exclude SDK history.

The same card `source` filter names this work:

```
'release' for stellar-core/CLI/SDK release notes (what shipped, when — protocol upgrade tags).
```

The catalog note names history as in-scope.
Catalog `routingKeywords` include `sdk` and `release`.

Verdict: `scout.searchResearch` belongs in the top five.
The same operation owns SDK release notes.
The forbid-top-five label is not valid.

### 4.10 `phb-control-cap-history-sep-support` — DISPUTED CONTROL

Class: `standards-reference`.
Question: `What is the CAP history for wallet SEP support?`

Matching `useWhen` text:

```
'what does the SEP/spec/audit say about X'
```

Inventory keywords include `cap`, `sep`, `seps`, and `standards`.
The `source` enum includes `cap` and `sep`.
The catalog note names history and standards.
`notFor` does not apply.

Verdict: `scout.searchResearch` belongs in the top five.
The forbid-top-five label is not valid.

Symmetry: this is the same CAP-history ask as several positives, with a wallet SEP topic.

### 4.11 `phb-control-kyc-breach-report` — VALID CONTROL, with leakage

Class: `incident-reporting`.
Question: `Report a breach in my anchor KYC flow.`

The verb is `Report`.
The object is `my anchor KYC flow`.
That is an action on user work, not a cited-history lookup.

`useWhen` does name KYC and where to report:

```
compliance & regulation (Travel Rule, FATF, KYC/AML, sanctions)
```

```
where to report
```

`notFor` does not apply.

Verdict: `scout.searchResearch` does not belong in the top five.
The question is an imperative report, not a where-to-report lookup.

Leakage: `kyc` is a catalog routing keyword.
A where-to-report reading would pull this card.

### 4.12 `phb-control-client-protocol-version-failure` — VALID CONTROL, with leakage

Class: `client-debugging`.
Question: `Why did the transaction fail after I set the protocol version on the test client?`

The subject is a test client that the user set.
That is client debugging.
`useWhen` why-explainers are ecosystem knowledge.

`notFor` does not apply.

Verdict: `scout.searchResearch` does not belong in the top five.

Leakage: `protocol version` plus `why` overlaps chronology positives.

### 4.13 `phb-control-failed-deploy-post-mortem` — VALID CONTROL, with leakage

Class: `implementation-review`.
Question: `Write a post-mortem of my failed contract deploy.`

The verb is `Write`.
The object is `my failed contract deploy`.
`useWhen` names retrieval of cited post-mortems, not authorship of a local one.

Matching retrieval text:

```
security & risk (audits, exploits, incidents, post-mortems, oracle manipulation)
```

`source` text:

```
'incident' for exploit/post-mortem history
```

`notFor` does not apply.

Verdict: `scout.searchResearch` does not belong in the top five.

Leakage is high.
The token `post-mortem` is on the card, the keywords, and these positives:

- `ph-security-incident-postmortems`
- `phb-whisk-post-mortem`

## 5. Disputed labels

Four of 13 control labels do not hold under the card.

| ID | Frozen label | This review | Exact supporting text |
|---|---|---|---|
| `ph-control-validator-vote` | forbid top five | belongs in top five | `useWhen`: `'how does X work'` |
| `ph-control-clawback-cap` | forbid top five | belongs in top five | `useWhen`: `'what does the SEP/spec/audit say about X'` |
| `phb-control-sdk-version-history` | forbid top five | belongs in top five | `source`: `'release' for stellar-core/CLI/SDK release notes` |
| `phb-control-cap-history-sep-support` | forbid top five | belongs in top five | `useWhen`: `'what does the SEP/spec/audit say about X'` |

These four controls cannot measure false capture of `scout.searchResearch`.
A top-five hit on any of them is in-scope card behavior.

Nine of 13 control labels hold.
Those nine still carry leakage, listed in section 4 and section 7.

I do not change the frozen labels in this review.

## 6. Positive labels — symmetry and leakage only

I do not relabel positives.
All 19 positives stay inside the card.

They match cited history, incidents, audits, CAPs, or post-mortems.
`notFor` excludes none of them.

The symmetry problem is the control side.
Several positives share topic or tokens with a control that this review disputes or marks for leakage.

### 6.1 Same-topic pairs

| Positive | Positive question | Nearby control | Boundary |
|---|---|---|---|
| `ph-protocol-feature-origin` | historical reason for a protocol feature, the CAP that introduced it, and later incident-driven changes | `ph-control-clawback-cap` | The control asks only which CAP and protocol version introduced clawback. That is the spec half of the positive. |
| `phb-clawback-origin-emergency-changes` | origin story of clawback and later emergency changes | `ph-control-clawback-cap` | Same feature. The control is the factoid. The positive adds origin and emergency change. |
| `phb-cap-archival-fee-repair` | the CAP that cleaned up archival eviction and the stroop fee-pool repair | `ph-control-clawback-cap` | Both ask for a CAP. One is a repair CAP. One is an introduction CAP. The card does not split those. |
| `ph-protocol-upgrade-chronology` | upgrades 19 through 24, when each shipped, and why the next followed | `phb-control-sdk-version-history` | Both ask a version history list. One is protocol. One is SDK. The `source=release` text covers both. |
| `phb-core-upgrades-dates-features` | core upgrades from P19 onward with dates and the feature each shipped | `phb-control-sdk-version-history` | Same list shape. The card does not keep SDK history off this operation. |
| `ph-protocol-feature-origin` and `phb-core-upgrades-dates-features` | CAP and feature history | `phb-control-cap-history-sep-support` | Same CAP-history ask. The control only changes the topic to wallet SEP support. |

The clawback pair is the worst symmetry break.
The frozen set requires `scout.searchResearch` for clawback origin.
The same set forbids `scout.searchResearch` for the CAP that introduced clawback.
The card `useWhen` covers both asks.

### 6.2 Token leakage from valid positives into valid controls

These positives stay in scope.
Their tokens can still pull a valid control.

| Positive tokens | Positive IDs | Valid control that shares the tokens |
|---|---|---|
| `post-mortem` | `ph-security-incident-postmortems`, `phb-whisk-post-mortem` | `phb-control-failed-deploy-post-mortem` |
| `incident` | `ph-security-incident-postmortems`, `ph-yieldblox-oracle-incident` | `phb-control-incident-runbook` |
| `exploit` plus Soroban | `ph-soroban-auth-audit-history` | `phb-control-contract-exploit-review` |
| `why` plus protocol upgrade | `ph-protocol-24-archival-root-cause`, `phb-second-cut-after-whisk` | `phb-control-contract-fail-after-upgrade` |
| protocol version | `ph-protocol-upgrade-chronology` | `ph-control-current-protocol`, `phb-control-client-protocol-version-failure` |

No positive is a hidden control.
No positive asks the user to debug, report, or write about their own work.

## 7. Risks

1. The combined 13-control forbid-top-five rule is not a valid false-capture test.
   Four controls belong on the target card.

2. The card is broader than the lane name.
   The contracts are named protocol-history.
   The card is a general cited-research surface.

3. `notFor` is too thin to protect controls.
   It only names product lookup and ranked GitHub search.

4. Keyword leakage can still place valid controls in the top five.
   High-risk tokens are `post-mortem`, `incident`, `exploit`, `protocol`, `current`, `kyc`, and `bug`.

5. The OpenAPI how-to sentence can pull `ph-control-soroban-deploy` even though `useWhen` does not name deploy.

6. A where-to-report reading of `phb-control-kyc-breach-report` can pull the security-program `useWhen` line.

7. This review is a label verdict.
   It is not a measured rank.
   I did not run `eval:protocol-history`.

8. I did not read other 2026-09-02 reports.
   This file does not reconcile against them.

## 8. Final review verdict

**REJECT** the frozen control set as a combined exclude-top-five test.

Count:

- 13 controls reviewed.
- 4 disputed controls: `ph-control-validator-vote`, `ph-control-clawback-cap`, `phb-control-sdk-version-history`, `phb-control-cap-history-sep-support`.
- 9 valid controls, several with leakage.
- 19 positives remain in scope.
- 0 positives relabeled.

`scout.searchResearch` belongs in the top five for the four disputed controls.
The card `useWhen`, and the same-card `source` filter, assign that work to this operation.
`notFor` does not remove them.

The 19 positive labels are consistent with the card.
The symmetry break sits on the control side, above all on clawback CAP lookup versus clawback origin.

Do not use the frozen 13-control rule as a ship test until those four labels are re-adjudicated.
This review does not change the labels.
