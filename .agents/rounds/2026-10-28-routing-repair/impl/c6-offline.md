The offline C6 prototype fails its validation. I recommend that the lead reject gate wiring with these frozen artifacts.

The classifier has 50.8% intent agreement and 27.8% object agreement on the 532 graded corpus rows. Joint agreement is 15.4%.

The offline compatibility comparison keeps the research result that blocks OpenZeppelin. It flags suitable OpenZeppelin skills and Docs as incompatible. It also retains the third mixed RWA control.

The requested offline work is complete. I wait for the lead’s go before wiring any gate into search.

The binding parent is `c4p + F4 + F5`, from [the C4 rulings](../lanes/c4-rulings.md). C4 and C5 are excluded as parents.

F4 skips existing STOPWORDS and query tokens shorter than three characters in the local schema-support comparison. F5 pins the Porter source. E2 remains. No C6 gate or parent edit entered the search sources during this offline work.

The source metadata used here matches the parent catalogs. C4 and C2 manifests match byte-for-byte on both sources. [The checks](c6-offline/checks.json) verify all 165 entry versions, including both diagnostic RWA entries.

The label and classifier artifacts are frozen and commit-ready under `tmp/impl/`. The implementation brief reserves commits for the lead, so this lane made no commit.

The eight intent classes and thirteen object classes follow the independent proposal. [The taxonomy](c6-offline/taxonomy.json) contains their complete definitions.

| Intent class | Meaning |
| --- | --- |
| inventory | Discover what exists, who provides it, or whether it is available or live. |
| howto | Build, implement, configure, operate, integrate, or debug something. |
| reference | Explain a meaning, concept, protocol rule, specification, or factual definition. |
| analytics | Measure counts, totals, shares, distributions, trends, or activity across a set. |
| compare | Compare or contrast two or more alternatives. |
| detail | Retrieve a single identified item, its record, metadata, or full details. |
| locate | Locate an exact definition, declaration, symbol, file, or line in source code. |
| content | Find editorial material, articles, interviews, talks, research reports, or other published coverage. |

| Object class | Meaning |
| --- | --- |
| project | A project, product, application, protocol team, or ecosystem organization. |
| asset | A token, issued asset, balance, fund, stablecoin, security, or payment instrument. |
| hackathon | A hackathon, contest, competition, its rules, judging, or build event. |
| submission | A particular submitted proposal, contest entry, or funding application. |
| person | A person, contributor, founder, speaker, or team member. |
| repo | A software repository, repository overview, repository structure, or its activity. |
| source-symbol | A code symbol, function, declaration, implementation, source file, or line. |
| doc-page | A documentation page, documentation title, section, or documentation category. |
| standard | A technical standard, specification, protocol concept, interface, or rule. |
| funding-round | A funding round, grant program, grant request, RFP, or SCF round. |
| partner | A partner, commercial integration provider, service provider, or infrastructure provider. |
| content | An article, video, interview, talk, research report, or editorial passage. |
| network-fact | A network parameter, network identifier, network passphrase, network endpoint, or network status fact. |

The training set contains 2,138 labeled strings: 1,575 catalog strings, 147 exclusion strings, and 416 synthetic questions. The catalog strings come from descriptions and the published routing fields. Exclusion strings lose their arrow targets.

The source versions include main and fresh. Each entry version records its exact source signature, SHA-256, label references, intent set, and object set. Entry sets contain the union of positive source labels. Exclusion labels remain separate.

The builder input inventory stays frozen. No live inventory fetch occurred. The labeler used each source purpose as context for short or ambiguous strings. [Entry provenance](c6-offline/entry-sources.json) and [entry classes](c6-offline/artifacts/entry-classes.json) retain that evidence.

Two source example instances matched a held-out question and were excluded before training. [The overlap record](c6-offline/excluded-overlap.json) lists both instances. No corpus or supplied probe text appears in training.

The 532 corpus rows contain 531 distinct question strings. The duplicate question shares one label. The supplied probe file contains 149 questions. Those questions supplied measurement labels only.

Clef supplied primary intent and object choices. I reviewed all eleven synthetic disagreements. I corrected nine model labels and accepted two model labels. [The review](c6-offline/synthetic-review.json) records each decision and reason.

The final training freeze occurred at `2026-10-29T00:14:26.950Z`. The model SHA-256 is `f7ba8a7307951950afb453d0fbba8257ec5f08de661df3460314558d17a6e934`.

I then authored 64 new held-out questions. Twenty-four contain at least 30 words and several clauses. [The construction record](c6-offline/new-heldout-construction.json) records the creation time and frozen model hash.

The new set has seven author-versus-Clef disagreements. I corrected four model labels and accepted three model labels. [The held-out review](c6-offline/new-heldout-review.json) records those decisions. No held-out label changed training or weights.

“Accuracy” below means agreement with the measurement labels. Corpus and supplied-probe labels are Clef proposals, not independently established truth. The new set uses the reviewed labels. Raw Clef agreement is also shown.

| Measurement set | n | Intent accuracy | Object accuracy | Both axes correct |
| --- | --- | --- | --- | --- |
| probes | 149 | 90/149 (60.4%) | 64/149 (43.0%) | 44/149 (29.5%) |
| probesWithoutShortTokens | 129 | 86/129 (66.7%) | 61/129 (47.3%) | 43/129 (33.3%) |
| newHeldout | 64 | 53/64 (82.8%) | 38/64 (59.4%) | 32/64 (50.0%) |
| newHeldoutRawClef | 64 | 53/64 (82.8%) | 37/64 (57.8%) | 31/64 (48.4%) |
| newLong | 24 | 17/24 (70.8%) | 13/24 (54.2%) | 9/24 (37.5%) |
| corpus | 532 | 270/532 (50.8%) | 148/532 (27.8%) | 82/532 (15.4%) |
| corpusLong | 76 | 31/76 (40.8%) | 9/76 (11.8%) | 3/76 (3.9%) |

`newLong` contains the 24 new long questions. `corpusLong` contains the 76 corpus questions with at least 30 words. The poor long-question results directly address the lead’s added validation requirement.

| Supplied probe group | n | Intent accuracy | Object accuracy | Both axes correct |
| --- | --- | --- | --- | --- |
| shortTokens | 20 | 4/20 (20.0%) | 3/20 (15.0%) | 1/20 (5.0%) |
| hackathonNegatives | 22 | 15/22 (68.2%) | 5/22 (22.7%) | 3/22 (13.6%) |
| hackathonPositives | 12 | 8/12 (66.7%) | 6/12 (50.0%) | 4/12 (33.3%) |
| locateNegatives | 20 | 14/20 (70.0%) | 13/20 (65.0%) | 10/20 (50.0%) |
| locatePositives | 5 | 5/5 (100.0%) | 5/5 (100.0%) | 5/5 (100.0%) |
| rwaDiscovery | 10 | 9/10 (90.0%) | 7/10 (70.0%) | 6/10 (60.0%) |
| rwaImplementation | 20 | 14/20 (70.0%) | 2/20 (10.0%) | 1/20 (5.0%) |
| schemaWords | 20 | 8/20 (40.0%) | 4/20 (20.0%) | 2/20 (10.0%) |
| taxonomyPositives | 12 | 8/12 (66.7%) | 12/12 (100.0%) | 8/12 (66.7%) |
| taxonomyNegatives | 8 | 5/8 (62.5%) | 7/8 (87.5%) | 4/8 (50.0%) |

The deterministic model is multinomial naive Bayes. It uses Laplace smoothing of one and uniform class priors. Fixed class order breaks ties. It makes no model or network call during prediction.

Intent features use the first three token positions, leading token pairs, and a general action and question-word vocabulary. Object features use whole-query token and token-pair presence. Porter normalizes feature tokens. These object features extend the proposal’s frame features to carry object nouns.

The [classifier code](c6-offline/classifier.mjs) and [frozen weights](c6-offline/artifacts/classifier.json) fully define prediction. The weights occupy 795202 bytes. This exceeds the proposal’s few-KB expectation.

The Porter copy uses source commit `74966c2bc432fc0f7873142268badded3368f405`. [The source receipt](c6-offline/porter-source.json) records its hash and TypeScript adaptation. The pinned header and MIT license accompany the copy.

The integrity checks pass. Repeated prediction is identical. A fresh fit from the reviewed training records reproduces both models. Frozen files remain unchanged after held-out measurement. Training-versus-measurement text overlap is zero.

The following confusion matrices use gold-label rows and predicted-label columns. Zero-support classes remain visible.

probes: intent confusion matrix.

| Gold / predicted | inventory | howto | reference | analytics | compare | detail | locate | content |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| inventory | 34 | 2 | 1 | 3 | 0 | 2 | 1 | 2 |
| howto | 1 | 25 | 2 | 0 | 0 | 4 | 1 | 0 |
| reference | 8 | 4 | 12 | 0 | 0 | 3 | 1 | 1 |
| analytics | 1 | 1 | 0 | 4 | 0 | 0 | 0 | 0 |
| compare | 1 | 0 | 1 | 0 | 2 | 0 | 0 | 0 |
| detail | 5 | 2 | 5 | 0 | 1 | 7 | 1 | 3 |
| locate | 0 | 1 | 0 | 0 | 0 | 0 | 6 | 0 |
| content | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |

probes: object confusion matrix.

| Gold / predicted | project | asset | hackathon | submission | person | repo | source-symbol | doc-page | standard | funding-round | partner | content | network-fact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| project | 25 | 0 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 1 | 0 | 0 |
| asset | 3 | 12 | 0 | 0 | 0 | 0 | 2 | 18 | 0 | 0 | 0 | 0 | 0 |
| hackathon | 3 | 0 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| submission | 2 | 0 | 1 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| person | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| repo | 1 | 0 | 0 | 0 | 0 | 7 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| source-symbol | 1 | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 1 | 0 |
| doc-page | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 4 | 0 | 0 | 1 | 1 | 0 |
| standard | 11 | 0 | 0 | 1 | 0 | 0 | 1 | 8 | 1 | 0 | 1 | 0 | 0 |
| funding-round | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| partner | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| content | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| network-fact | 4 | 0 | 0 | 0 | 0 | 0 | 6 | 3 | 4 | 0 | 0 | 1 | 1 |

newHeldout: intent confusion matrix.

| Gold / predicted | inventory | howto | reference | analytics | compare | detail | locate | content |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| inventory | 6 | 0 | 0 | 0 | 0 | 2 | 0 | 0 |
| howto | 1 | 7 | 0 | 0 | 0 | 0 | 0 | 0 |
| reference | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |
| analytics | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 0 |
| compare | 0 | 2 | 0 | 0 | 6 | 0 | 0 | 0 |
| detail | 0 | 2 | 2 | 0 | 0 | 5 | 0 | 0 |
| locate | 0 | 0 | 0 | 0 | 0 | 0 | 8 | 0 |
| content | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 6 |

newHeldout: object confusion matrix.

| Gold / predicted | project | asset | hackathon | submission | person | repo | source-symbol | doc-page | standard | funding-round | partner | content | network-fact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| project | 4 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| asset | 1 | 2 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 | 0 | 0 |
| hackathon | 0 | 0 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 1 | 0 |
| submission | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| person | 1 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| repo | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| source-symbol | 0 | 0 | 0 | 0 | 0 | 0 | 9 | 1 | 0 | 0 | 0 | 0 | 0 |
| doc-page | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| standard | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 3 | 0 | 0 | 0 | 0 |
| funding-round | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| partner | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 |
| content | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 7 | 0 |
| network-fact | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 |

corpus: intent confusion matrix.

| Gold / predicted | inventory | howto | reference | analytics | compare | detail | locate | content |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| inventory | 68 | 5 | 5 | 3 | 0 | 1 | 0 | 2 |
| howto | 35 | 91 | 11 | 8 | 1 | 5 | 0 | 0 |
| reference | 57 | 17 | 93 | 9 | 4 | 6 | 2 | 1 |
| analytics | 2 | 2 | 2 | 8 | 0 | 0 | 0 | 0 |
| compare | 11 | 6 | 7 | 10 | 2 | 1 | 1 | 0 |
| detail | 13 | 5 | 14 | 0 | 1 | 6 | 1 | 1 |
| locate | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 |
| content | 4 | 2 | 2 | 3 | 0 | 1 | 1 | 0 |

corpus: object confusion matrix.

| Gold / predicted | project | asset | hackathon | submission | person | repo | source-symbol | doc-page | standard | funding-round | partner | content | network-fact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| project | 85 | 3 | 0 | 0 | 1 | 0 | 1 | 24 | 0 | 1 | 0 | 0 | 0 |
| asset | 15 | 9 | 0 | 0 | 0 | 0 | 1 | 12 | 0 | 0 | 1 | 0 | 0 |
| hackathon | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| submission | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| person | 1 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| repo | 10 | 0 | 0 | 0 | 0 | 10 | 2 | 6 | 0 | 0 | 0 | 0 | 0 |
| source-symbol | 5 | 0 | 0 | 0 | 0 | 1 | 2 | 21 | 0 | 0 | 0 | 0 | 0 |
| doc-page | 4 | 0 | 0 | 0 | 0 | 2 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |
| standard | 67 | 8 | 0 | 1 | 0 | 9 | 7 | 116 | 8 | 1 | 0 | 0 | 0 |
| funding-round | 12 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 23 | 0 | 0 | 0 |
| partner | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| content | 12 | 0 | 0 | 0 | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 1 | 0 |
| network-fact | 14 | 0 | 1 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 0 |

newLong: intent confusion matrix.

| Gold / predicted | inventory | howto | reference | analytics | compare | detail | locate | content |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| inventory | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| howto | 1 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| reference | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 |
| analytics | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |
| compare | 0 | 1 | 0 | 0 | 2 | 0 | 0 | 0 |
| detail | 0 | 2 | 0 | 0 | 0 | 1 | 0 | 0 |
| locate | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 |
| content | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 1 |

newLong: object confusion matrix.

| Gold / predicted | project | asset | hackathon | submission | person | repo | source-symbol | doc-page | standard | funding-round | partner | content | network-fact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| project | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| asset | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| hackathon | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| submission | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| person | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| repo | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| source-symbol | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 |
| doc-page | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| standard | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 0 |
| funding-round | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| partner | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| content | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 |
| network-fact | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

corpusLong: intent confusion matrix.

| Gold / predicted | inventory | howto | reference | analytics | compare | detail | locate | content |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| inventory | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| howto | 18 | 28 | 1 | 2 | 0 | 1 | 0 | 0 |
| reference | 5 | 2 | 2 | 1 | 0 | 1 | 0 | 0 |
| analytics | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| compare | 3 | 4 | 3 | 0 | 0 | 0 | 0 | 0 |
| detail | 0 | 1 | 2 | 0 | 0 | 0 | 0 | 0 |
| locate | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| content | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

corpusLong: object confusion matrix.

| Gold / predicted | project | asset | hackathon | submission | person | repo | source-symbol | doc-page | standard | funding-round | partner | content | network-fact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| project | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 |
| asset | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 |
| hackathon | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| submission | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| person | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| repo | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| source-symbol | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 0 | 0 | 0 |
| doc-page | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |
| standard | 14 | 0 | 0 | 0 | 0 | 0 | 0 | 20 | 0 | 0 | 0 | 0 | 0 |
| funding-round | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |
| partner | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| content | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| network-fact | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |

Per-class recall makes the class imbalance visible. A dash means that the measurement set has no gold example for that class.

intent: per-class support and recall.

| Class | Probes n / recall | New held-out n / recall | Corpus n / recall | New long n / recall | Corpus long n / recall |
| --- | --- | --- | --- | --- | --- |
| inventory | 45 / 75.6% | 8 / 75.0% | 84 / 81.0% | 3 / 66.7% | 1 / 100.0% |
| howto | 33 / 75.8% | 8 / 87.5% | 151 / 60.3% | 3 / 66.7% | 50 / 56.0% |
| reference | 29 / 41.4% | 7 / 100.0% | 189 / 49.2% | 3 / 100.0% | 11 / 18.2% |
| analytics | 6 / 66.7% | 8 / 100.0% | 14 / 57.1% | 3 / 100.0% | 0 / — |
| compare | 4 / 50.0% | 8 / 75.0% | 38 / 5.3% | 3 / 66.7% | 10 / 0.0% |
| detail | 24 / 29.2% | 9 / 55.6% | 41 / 14.6% | 3 / 33.3% | 3 / 0.0% |
| locate | 7 / 85.7% | 8 / 100.0% | 2 / 100.0% | 3 / 100.0% | 0 / — |
| content | 1 / 0.0% | 8 / 75.0% | 13 / 0.0% | 3 / 33.3% | 1 / 0.0% |

object: per-class support and recall.

| Class | Probes n / recall | New held-out n / recall | Corpus n / recall | New long n / recall | Corpus long n / recall |
| --- | --- | --- | --- | --- | --- |
| project | 29 / 86.2% | 6 / 66.7% | 115 / 73.9% | 2 / 100.0% | 11 / 45.5% |
| asset | 35 / 34.3% | 6 / 33.3% | 38 / 23.7% | 2 / 0.0% | 7 / 0.0% |
| hackathon | 8 / 50.0% | 4 / 50.0% | 3 / 66.7% | 2 / 50.0% | 0 / — |
| submission | 5 / 40.0% | 3 / 0.0% | 3 / 0.0% | 2 / 0.0% | 0 / — |
| person | 0 / — | 4 / 25.0% | 3 / 66.7% | 0 / — | 0 / — |
| repo | 9 / 77.8% | 6 / 83.3% | 28 / 35.7% | 2 / 50.0% | 1 / 0.0% |
| source-symbol | 9 / 77.8% | 10 / 90.0% | 29 / 6.9% | 4 / 75.0% | 12 / 0.0% |
| doc-page | 8 / 50.0% | 1 / 100.0% | 12 / 50.0% | 0 / — | 3 / 66.7% |
| standard | 23 / 4.3% | 8 / 37.5% | 217 / 3.7% | 3 / 33.3% | 34 / 0.0% |
| funding-round | 1 / 0.0% | 1 / 100.0% | 38 / 60.5% | 1 / 100.0% | 3 / 66.7% |
| partner | 3 / 33.3% | 4 / 25.0% | 8 / 0.0% | 2 / 50.0% | 0 / — |
| content | 0 / — | 8 / 87.5% | 16 / 6.3% | 3 / 100.0% | 2 / 0.0% |
| network-fact | 19 / 5.3% | 3 / 66.7% | 22 / 0.0% | 1 / 0.0% | 3 / 0.0% |

The [complete metrics](c6-offline/metrics.json) retain every question, label, prediction, probability, class precision, and class recall.

The offline compatibility comparison follows the proposed probability comparison. An axis flags incompatibility when its largest class probability exceeds the sum for the entry’s allowed classes. It applies no identity or enum exceptions and does not rerank pages.

The following reference pages come from C2 fresh. The lead states that c4p has the same grades. These are offline class comparisons, not C6 routing results.

| Corpus row | Reference entry | Reference score | Predicted intent | Predicted object | Offline incompatible |
| --- | --- | --- | --- | --- | --- |
| q-soroban-oz-upgradeable-macro | skills.openzeppelin-stellar.upgrade-stellar-contracts | 580 | reference | doc-page | yes |
| q-soroban-oz-upgradeable-macro | skills.openzeppelin-stellar.setup-stellar-contracts | 430 | reference | doc-page | yes |
| q-soroban-oz-upgradeable-macro | scout.searchResearch | 281 | reference | doc-page | no |
| q-soroban-oz-upgradeable-macro | stellarDocs.search_soroban_contract_docs | 448 | reference | doc-page | yes |
| q-soroban-oz-upgradeable-macro | scout.searchRepos | 245 | reference | doc-page | yes |
| q-soroban-x402-auth-entry-signing | scout.listSkills | 287 | inventory | project | no |
| q-soroban-x402-auth-entry-signing | scout.searchHackathonBuilds | 271 | inventory | project | no |
| q-soroban-x402-auth-entry-signing | scout.getHackathon | 267 | inventory | project | yes |
| q-soroban-x402-auth-entry-signing | scout.searchProjects | 266 | inventory | project | no |
| q-soroban-x402-auth-entry-signing | scout.searchResearch | 266 | inventory | project | no |

For OpenZeppelin, the classifier predicts `reference`. The two appropriate skills and Soroban Docs have `howto` source labels, so the intent comparison rejects them. Research contains `reference` among its broad source labels and survives.

For x402, the classifier predicts `inventory`, so four of the five blocking Scout results survive the comparison. Only `getHackathon` is flagged. This does not establish recovery through the proposed gate.

| RWA check query | Discovery positive | Predicted intent | Predicted object | Offline incompatible |
| --- | --- | --- | --- | --- |
| Which tokenized real-world assets are live on Stellar? | yes | inventory | asset | no |
| Show verified tokenized treasury funds and their issuers on Stellar. | yes | inventory | asset | no |
| Are tokenized bonds and real estate assets live on Stellar? | yes | inventory | asset | no |
| Is Franklin Templeton BENJI actually issued on Stellar? | yes | inventory | asset | no |
| Simulate a transfer of a tokenized bond through Stellar RPC. | no | reference | doc-page | yes |
| How do I read a wallet balance for tokenized treasury assets? | no | howto | doc-page | yes |
| As a Stellar asset issuer, can I charge transfer fees, cap supply, or freeze a holder, and what is actually possible at the protocol level? | no | inventory | asset | no |

All four RWA positives remain compatible. Two mixed controls become incompatible. The issuer-fees, supply-cap, and freeze control remains compatible. Thus, the offline comparison does not solve check 8.

Four additional long mixed-intent questions test the probability comparison without changing the classifier. They are authored after the freeze and are not part of the 64-question accuracy set.

| Mixed question | Requested intents | Entry | Predicted intent | Offline incompatible |
| --- | --- | --- | --- | --- |
| List open developer contests and explain how a new team can register, prepare an entry, validate its eligibility, and complete the required submission steps before the published deadline. | inventory, howto | scout.getHackathons | inventory | no |
| Which audited tokenized funds are currently available, who issues each fund token, and how can a client application read a holder balance and verify the asset identifier before showing it? | inventory, howto | scout.getRwaAssets | inventory | yes |
| Find public data service providers with archival access, then explain how to configure one provider in a monitoring client and verify that the client can retrieve older transaction history. | inventory, howto | scout.getPartners | inventory | yes |
| Show the available asset issuance standards, explain the protocol guarantees of each standard, and compare their authorization models so our team can select a suitable integration for its regulated product. | inventory, reference, compare | scout.searchResearch | inventory | no |

Two mixed questions lose legitimate discovery compatibility. I infer that the object labels mix returned documents with requested subjects. This creates an inconsistent object axis. A single allowed intent also survives only when its probability ties or exceeds the dominant class. Mixed requests therefore need stronger validation.

The source projection also exposes broad class sets. `scout.searchResearch` spans six intent classes and eleven object classes on fresh. Some Docs and implementation skills receive only `doc-page` as their object. These machine label proposals need a clearer shared interpretation before serving use.

I did not tune the model on held-out errors, change routing labels, change gate thresholds, or rebaseline a score. The offline findings remain failures.

Cloudflare lists Clef at USD 0.24 per million input tokens. [The official model page](https://developers.cloudflare.com/workers-ai/models/clef/) supports that rate.

The completed labeling used 242 calls and 2,370,916 input tokens. Estimated spend is USD 0.56901984, below the approved USD 3 total. [The spend ledger](spend.md) records every batch, including the pilot.

Read-only model measurement can be reproduced with `node tmp/impl/c6-offline/evaluate.mjs` and `node tmp/impl/c6-offline/check.mjs`. The labeling responses and request plans remain available for review. Reproduction needs no paid call.

The tracked tree remains unchanged. The C4 report now corrects the T1 claim and distinguishes F2 from F3. The C6 parent remains c4p plus F4 and F5.

No C6 gate has entered search, no C6 routing run has occurred, and no deployment has occurred. The next action requires the lead’s go.

