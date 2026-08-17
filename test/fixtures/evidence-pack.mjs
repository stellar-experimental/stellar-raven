const sourceBasis = (shape) =>
  `\n--- SOURCE BASIS ---\nshape: ${shape}\ncalls: fixture.operation=ok/1ms\ncanonicalUrls: data-derived/untrusted; https://example.test/source`;

function projectedFixture(data) {
  return {
    ...data,
    transcript: data.provenance.transcriptProjection.map((entry) => {
      if (entry.literalResult) {
        return {
          tool: entry.tool,
          resultChars: entry.resultChars,
          isError: entry.isError,
          result: entry.literalResult
        };
      }
      const serialized = JSON.stringify({ records: entry.records });
      const padding = "x".repeat(Math.max(0, entry.resultChars - serialized.length - 900));
      return {
        tool: entry.tool,
        resultChars: entry.resultChars,
        isError: entry.isError,
        result:
          `${serialized.slice(0, -1)},"fixturePadding":"${padding}"}` +
          (entry.truncated ? sourceBasis(`object; ${entry.resultChars} chars`) : "")
      };
    })
  };
}

const savedRowProjections = [
  {
    "id": "q-live-beans-cross-service-reconcile",
    "provenance": {
      "resultsFile": "eval/qa/results/2026-08-14T04-13-13-variantA.json",
      "resultsFileSha256": "89255ce75dfeec0a71490905524ba06b4d4ddb6f6c22d5b3ef17c0f06d35a5e4",
      "transcriptSha256": "f08906d35d5a372df041aa488bef61ce745603cb707da93439d2028d5fb9d648",
      "projectionSha256": "f4c21610412081784396ecf371b197210d883dbc8eb00b9d0f3910a5af911c5d",
      "savedRowRequiredPackTerms": [
        "id1616633340",
        "com.beansapp.app",
        "2026-08-04",
        "2026-08-12",
        "2026-08-13"
      ],
      "transcriptProjection": [
        {
          "savedEntryIndex": 3,
          "tool": "mcp__raven__execute",
          "resultChars": 26098,
          "isError": false,
          "truncated": true,
          "records": [
            {
              "id": "6943366330bcaa9def8ef743",
              "name": "Beans",
              "slug": "beans",
              "category": "User-Facing App",
              "shortDescription": "Beans is a non-custodial Stellar wallet and money-transfer app for iOS and Android aimed at non-crypto-native users. It offers QR payments, multi-currency support, free wallet-to-wallet transfers and MoneyGram cash off-ramps across 185+ countries, abstracting blockchain complexity behind a familiar banking experience.",
              "status": "Live",
              "statusAsOf": "2025-12-17T23:01:55.180Z",
              "statusSourceUrl": null,
              "statusBasis": "source-inherited",
              "statusConfidence": {
                "score": 0.33,
                "label": "low",
                "ageDays": 239
              },
              "onchain": null,
              "publicGoods": null,
              "tvlUSD": null,
              "tvlAsOf": null,
              "tvlSource": null,
              "tvlMethod": null,
              "llamaSlugs": null,
              "tvlMethodUrl": null,
              "routes": null,
              "venueRole": null,
              "productKind": "end-user-wallet",
              "availability": [
                {
                  "platform": "ios",
                  "state": "available",
                  "storeUrl": "https://apps.apple.com/us/app/beans-app/id1616633340",
                  "checkedAt": "2026-08-13",
                  "note": "curator-agent draft: App Store link present; 'View in the Apple Store' and iOS store URL in markup"
                },
                {
                  "platform": "android",
                  "state": "available",
                  "storeUrl": "https://play.google.com/store/apps/details?id=com.beansapp.app",
                  "checkedAt": "2026-08-13",
                  "note": "curator-agent draft: Play Store link present; 'View in the Play Store' and Play store URL in markup"
                }
              ],
              "canonicalSlug": null,
              "identity": null,
              "lifecycle": null,
              "logoUrl": "/api/media/file/beans-logo-1.png",
              "scfAwarded": true,
              "feedbackSignal": null,
              "scfBasis": "official-record",
              "scfConfidence": {
                "score": 0.9,
                "label": "high",
                "ageDays": 2
              },
              "scfAsOf": "2026-08-12",
              "scfSourceUrl": "https://communityfund.stellar.org/project/beans-app-noa",
              "scfTotalAwardedUSD": 490160,
              "scfAmountStatus": "disclosed",
              "scfAwardedRounds": [
                10,
                15,
                21,
                29
              ],
              "scfRoundAwards": [
                {
                  "round": 10,
                  "amountUSD": 220000,
                  "awardType": "Legacy v3.0 Award"
                },
                {
                  "round": 15,
                  "amountUSD": 96640,
                  "awardType": "Legacy v4.0 Award"
                },
                {
                  "round": 21,
                  "amountUSD": 73780,
                  "awardType": "Legacy v5.0 Community Award"
                },
                {
                  "round": 29,
                  "amountUSD": 99740,
                  "awardType": "Legacy v5.0 Community Award"
                }
              ],
              "products": [],
              "hackathon": null,
              "hackathonPlacement": null,
              "hackathonPrize": null,
              "hackathonPrizeTrack": null,
              "prominence": 70,
              "verificationLevel": "Verified (Community)",
              "types": [
                "Wallet",
                "Payments"
              ],
              "coverage": null,
              "supportedNetworks": [],
              "links": {
                "website": "https://beansapp.com/",
                "github": "https://github.com/beans-bv",
                "twitter": "https://x.com/beansapp",
                "discord": "https://discord.gg/gpanszrcdp"
              },
              "score": 1,
              "url": "https://stellarlight.xyz/project/beans",
              "via": "keyword",
              "confidence": {
                "score": 0.97,
                "label": "high",
                "relevance": 1,
                "freshness": 1,
                "authority": 0.85,
                "ageDays": null
              },
              "repos": [
                {
                  "fullName": "Beans-BV/beans-merchant-sdk-javascript",
                  "url": "https://github.com/Beans-BV/beans-merchant-sdk-javascript",
                  "primaryLanguage": "JavaScript",
                  "stars": 7,
                  "repoScore": 45,
                  "repoScoreLabel": "medium",
                  "judgeScore": null,
                  "hackathonWinner": false,
                  "lastCommitAt": "2026-04-02T05:20:26.000Z"
                },
                {
                  "fullName": "Beans-BV/beans-merchant-sdk-dart",
                  "url": "https://github.com/Beans-BV/beans-merchant-sdk-dart",
                  "primaryLanguage": "Dart",
                  "stars": 1,
                  "repoScore": 25,
                  "repoScoreLabel": "low",
                  "judgeScore": null,
                  "hackathonWinner": false,
                  "lastCommitAt": "2026-04-02T05:19:08.000Z"
                },
                {
                  "fullName": "Beans-BV/beans-gitflow",
                  "url": "https://github.com/Beans-BV/beans-gitflow",
                  "primaryLanguage": "Rust",
                  "stars": 0,
                  "repoScore": 25,
                  "repoScoreLabel": "low",
                  "judgeScore": null,
                  "hackathonWinner": false,
                  "lastCommitAt": "2026-08-04T03:16:07.000Z"
                },
                {
                  "fullName": "Beans-BV/homebrew-tap",
                  "url": "https://github.com/Beans-BV/homebrew-tap",
                  "primaryLanguage": "Ruby",
                  "stars": 0,
                  "repoScore": 23,
                  "repoScoreLabel": "low",
                  "judgeScore": null,
                  "hackathonWinner": false,
                  "lastCommitAt": "2026-08-04T03:19:13.000Z"
                },
                {
                  "fullName": "Beans-BV/kulipa-dotnet-sdk",
                  "url": "https://github.com/Beans-BV/kulipa-dotnet-sdk",
                  "primaryLanguage": "C#",
                  "stars": 0,
                  "repoScore": 20,
                  "repoScoreLabel": "low",
                  "judgeScore": null,
                  "hackathonWinner": false,
                  "lastCommitAt": "2026-01-27T08:40:37.000Z"
                }
              ],
              "lastActivityAt": "2026-08-04T03:19:13.000Z",
              "builtBy": null,
              "anchorProfile": null,
              "audits": null
            },
            {
              "fullName": "Beans-BV/dotnet-stellar-sdk",
              "owner": "Beans-BV",
              "name": "dotnet-stellar-sdk",
              "url": "https://github.com/Beans-BV/dotnet-stellar-sdk",
              "description": "Stellar API SDK for .NET 8",
              "topics": [],
              "primaryLanguage": "C#",
              "stars": 10,
              "openIssues": 11,
              "lastCommitAt": "2026-07-22T02:35:24.000Z",
              "homepageUrl": "",
              "isFork": false,
              "isArchived": false,
              "activityState": "active",
              "activitySignals": {
                "commits90d": 14,
                "lastReleaseAt": "2026-06-07T15:22:32.000Z",
                "releaseTag": "15.1.0",
                "openPRs": 3,
                "asOf": "2026-08-14T03:02:59.036Z"
              },
              "codeInUse": null,
              "knowledgeNotes": [],
              "project": {
                "slug": "net-stellar-sdk",
                "name": ".NET Stellar SDK"
              },
              "hackathonWinner": false,
              "scfAwarded": false,
              "builderReputation": 0,
              "judgeScore": null,
              "judgedHackathon": null,
              "repoScore": 45,
              "repoScoreLabel": "medium",
              "score": 3,
              "deepWikiUrl": "https://deepwiki.com/Beans-BV/dotnet-stellar-sdk",
              "canonical": false,
              "stellarEvidence": "mentioned",
              "codeVerified": {
                "stellarProof": "none",
                "codeDepth": 0,
                "isDeployableContract": false,
                "sorobanSdkVersion": null,
                "ciPresent": null,
                "testsPresent": null,
                "versionStatus": "unknown",
                "scannedAt": "2026-07-06T15:41:44.574Z",
                "codeConfidence": {
                  "score": 0.77,
                  "label": "high",
                  "ageDays": 38
                },
                "scannedRef": null,
                "symbols": [],
                "contractInterface": [],
                "stellarDeps": [],
                "targetProtocol": null,
                "protocolCaps": [],
                "mainnetContractId": null,
                "sdkCapabilities": []
              }
            }
          ]
        },
        {
          "savedEntryIndex": 4,
          "tool": "mcp__raven__execute",
          "resultChars": 8534,
          "isError": false,
          "truncated": false,
          "records": [
            {
              "slug": "beans",
              "title": "Beans",
              "description": "Beans is a non-custodial payments and savings app built on the Stellar blockchain, designed to provide the general public with a seamless banking experience that leverages blockchain technology. By abstracting complex blockchain elements, Beans offers instant, free, and secure international money transfers, currency conversions at competitive rates and savings accounts.",
              "category": "Applications",
              "tags": [
                "Software Wallet",
                "Mobile",
                "P2P",
                "Cross-Border Payments",
                "DeFi"
              ],
              "website": "[\"beansapp.com\"]"
            },
            {
              "slug": "beans",
              "title": "Beans",
              "description": "Beans is a non-custodial payments and savings app built on the Stellar blockchain, designed to provide the general public with a seamless banking experience that leverages blockchain technology. By abstracting complex blockchain elements, Beans offers instant, free, and secure international money transfers, currency conversions at competitive rates and savings accounts.",
              "category": "Applications",
              "tags": [
                "Software Wallet",
                "Mobile",
                "P2P",
                "Cross-Border Payments",
                "DeFi"
              ],
              "operating_region": [
                "Netherlands"
              ],
              "based_in": "Netherlands",
              "other_names": [
                "Beans app"
              ],
              "parent": null,
              "links": {
                "website": [
                  "beansapp.com"
                ],
                "blog": [
                  "beansapp.com/blog"
                ],
                "x": [
                  "beansapp"
                ],
                "linkedin": [
                  "linkedin.com/company/beans-bv"
                ],
                "discord": [
                  "discord.gg/gpanszrcdp"
                ],
                "telegram": [
                  "t.me/wearebeansapp"
                ],
                "youtube": [
                  "youtube.com/@beansapp"
                ],
                "instagram": [
                  "beansapp_"
                ],
                "github": [
                  "github.com/beans-bv"
                ]
              },
              "scf": {
                "awarded_round": [
                  10,
                  15,
                  21,
                  29
                ],
                "awarded_total": 490160,
                "submission_urls": [
                  "communityfund.stellar.org/submissions/reclezdtsxQM16L25",
                  "communityfund.stellar.org/submissions/recoZCxDJu6l9Sy9S",
                  "communityfund.stellar.org/submissions/recCm6EsKKmPbx6ow",
                  "communityfund.stellar.org/submissions/recl9kp1khhJSoxKF"
                ]
              },
              "mainnet": {
                "tokens": [],
                "audits": []
              }
            }
          ]
        }
      ]
    },
    "question": "I'm evaluating Beans for a Stellar payment app. What do Scout and Lumenloop each say it is, who is behind it, and whether it's current? Reconcile any differences for me.",
    "golden": {
      "answer": "A grounded answer resolves Beans independently in Scout and Lumenloop, attributes each field to the service that served it, and reconciles identity, product description, builder/company evidence, category, links, and lifecycle scope. Agreement that Beans is a non-custodial Stellar payments/money-transfer app may be reported as agreement, while differences in taxonomy, location, funding detail, or omitted fields remain scoped to each record. A Scout status must be qualified by its current statusAsOf/statusBasis/statusSourceUrl/supportedNetworks state; a null builtBy is not permission to invent a builder. Primary Beans operator/store/company evidence may identify Beans B.V., but directory agreement alone is not independent proof of deployment.",
      "keyFacts": [
        "Queries both services and attributes their current Beans identity, descriptions, links, and lifecycle fields separately.",
        "Reconciles agreement, omission, taxonomy differences, and actual conflicts instead of silently selecting or fusing one record.",
        "Uses primary Beans evidence for company/builder attribution and does not over-promote an unqualified directory status to verified deployment."
      ],
      "avoid": [
        "Do NOT fabricate a Scout builtBy value, merge incompatible fields into a fictional canonical record, or call an omitted field a contradiction.",
        "Do NOT treat two aggregator records agreeing as independent proof of current mainnet deployment."
      ],
      "notes": "LIVE-DATA CASE: grade reconciliation, not a frozen field roster. Current services may converge or diverge later. Correct behavior labels every claim by source and uses primary evidence for builder/company claims."
    },
    "tags": {
      "category": "retail-consumer",
      "service": "scout",
      "freshness": "live"
    },
    "candidateAnswer": "**What Scout says**\nScout's directory (stellarlight.xyz, live-checked 2026-08-14) describes Beans as a non-custodial Stellar wallet and money-transfer app for iOS and Android. It targets non-crypto-native users. It offers QR payments, multi-currency support, free wallet-to-wallet transfers, and MoneyGram cash off-ramps in 185+ countries. Source: https://stellarlight.xyz/project/beans\n\n**What Lumenloop says**\nLumenloop's directory describes Beans as a non-custodial payments *and savings* app built on Stellar. It aims to give the general public a familiar banking experience. It offers instant, free international transfers, currency conversion at competitive rates, and interest-bearing savings accounts. Source: beansapp.com (per Lumenloop directory entry).\n\n**Reconciling the difference**\nBoth sources agree on the core: non-custodial, built on Stellar, cross-border money transfers, abstracted blockchain complexity for mainstream users. The gap is emphasis, not conflict. Scout stresses the wallet/QR-payment/off-ramp mechanics. Lumenloop adds the savings-account angle, which Scout's summary omits. Lumenloop's own historical content (e.g. a 2023-11-01 post \"Bulk payments with Beans!\") confirms the savings/disbursement features are real, longstanding parts of the product, not a fresher pivot Scout missed.\n\n**Who is behind it**\nBeans is built by Beans BV, based in the Netherlands (confirmed by Lumenloop's `based_in` field and Scout's GitHub org `Beans-BV`). It has been funded by the Stellar Community Fund across four rounds — 10, 15, 21, and 29 — totaling $490,160. Both Scout and Lumenloop report this exact figure independently, which corroborates it. SCF record: https://communityfund.stellar.org/project/beans-app-noa\n\n**Is it current?**\nYes, by several independent signals as of 2026-08-14:\n- App Store and Google Play listings were checked 2026-08-13 and both show \"available\" (iOS id1616633340; Android com.beansapp.app).\n- GitHub activity is recent: `Beans-BV/beans-gitflow` and `Beans-BV/homebrew-tap` both had commits on 2026-08-04; the `.NET Stellar SDK` maintained under the Beans-BV org shows 14 commits in the last 90 days.\n- SCF funding data was refreshed 2026-08-12 (2 days old, high confidence).\n\nOne caveat: Scout's \"Live\" status label itself carries low confidence (0.33) because the status flag hasn't been independently re-verified in 239 days — it's inherited from an older source, not freshly re-attested. But the corroborating app-store checks and code activity above are all fresh, so the practical answer is: Beans is current and active.",
    "requiredPackTerms": [
      "id1616633340",
      "com.beansapp.app",
      "scfAsOf=\"2026-08-12\"",
      "scfTotalAwardedUSD=\"490160\"",
      "\"scfAwardedRounds\":[10,15,21,29]",
      "Beans-BV/beans-gitflow",
      "lastCommitAt=\"2026-08-04T03:16:07.000Z\"",
      "Beans-BV/dotnet-stellar-sdk",
      "\"lastCommitAt\":\"2026-07-22T02:35:24.000Z\"",
      "commits90d=\"14\"",
      "https://communityfund.stellar.org/project/beans-app-noa"
    ]
  },
  {
    "id": "q-tool-indexer-repos-discovery",
    "provenance": {
      "resultsFile": "eval/qa/results/2026-08-14T03-56-23-variantA.json",
      "resultsFileSha256": "93347cdaabb3b8e96d3598139ae56b42587bac30e5f94d3717b0b0b7fe0ba936",
      "transcriptSha256": "864ffd0ea7b20f28614ac1a3129bba56d21bd6f6107904052a4ea389ea76422b",
      "projectionSha256": "01e31eb7c733eba4709446c5d0acc9e6f60187de055f9dd68dc7bada27bdb8a0",
      "savedRowRequiredPackTerms": [
        "subquery/subql-stellar",
        "subquery/stellar-subql-starter",
        "xycloo/rs-zephyr-toolkit",
        "Galexie"
      ],
      "transcriptProjection": [
        {
          "savedEntryIndex": 4,
          "tool": "mcp__raven__execute",
          "resultChars": 26232,
          "isError": false,
          "truncated": true,
          "records": [
            {
              "name": "stellar-etl",
              "owner": "stellar",
              "url": "https://github.com/stellar/stellar-etl",
              "desc": "Stellar ETL will enable real-time analytics on the Stellar network",
              "lang": "Go",
              "stars": 39,
              "activity": "maintained",
              "score": 45
            },
            {
              "name": "stellar-dbt-public",
              "owner": "stellar",
              "url": "https://github.com/stellar/stellar-dbt-public",
              "desc": "Public DBT instance to aid in data transformation for analytics purposes",
              "lang": "Shell",
              "stars": 12,
              "activity": "active",
              "score": 42
            },
            {
              "name": "stellar-ledger-data-indexer",
              "owner": "stellar",
              "url": "https://github.com/stellar/stellar-ledger-data-indexer",
              "desc": "Stellar Ledger Data Indexer indexes ledger data by transaction_hash, contract_id, etc",
              "lang": "Go",
              "stars": 3,
              "activity": "active",
              "score": 36
            },
            {
              "name": "socketfi-account-indexer",
              "owner": "socket-fi",
              "url": "https://github.com/Socket-Fi/socketfi-account-indexer",
              "desc": null,
              "lang": "TypeScript",
              "stars": 0,
              "activity": "active",
              "score": 59
            },
            {
              "name": "market-indexer",
              "owner": "yieldback-cash",
              "url": "https://github.com/YieldBack-Cash/market-indexer",
              "desc": "Indexer for tracking market deployments",
              "lang": "TypeScript",
              "stars": 0,
              "activity": "active",
              "score": 50
            },
            {
              "name": "trustlesswork-indexer-go",
              "owner": "trustless-work",
              "url": "https://github.com/Trustless-Work/trustlesswork-indexer-go",
              "desc": "Trustless Work official Indexer",
              "lang": "Go",
              "stars": 4,
              "activity": "active",
              "score": 39
            },
            {
              "name": "indexer",
              "owner": "axis-markets",
              "url": "https://github.com/axis-markets/indexer",
              "desc": "Service that scans AXIS events and maintains current orderbook state in memory",
              "lang": "JavaScript",
              "stars": 0,
              "activity": "maintained",
              "score": 31
            },
            {
              "name": "mercury-indexer-asset-price-estimator",
              "owner": "kwickbit",
              "url": "https://github.com/kwickbit/mercury-indexer-asset-price-estimator",
              "desc": "A Mercury (Zephyr VM) project for estimating the fiat price (USD) of any asset on the Stellar network by processing transaction data involving USDT, USDC, and XLM.",
              "lang": "Rust",
              "stars": 2,
              "activity": "dormant",
              "score": 31
            },
            {
              "name": "ortegeETL",
              "owner": "ortege-xyz",
              "url": "https://github.com/Ortege-xyz/ortegeETL",
              "desc": "Ortege's ETL library for all blockchains",
              "lang": "Python",
              "stars": 4,
              "activity": "dormant",
              "score": 31
            },
            {
              "name": "phoenix-zephyr-indexer",
              "owner": "soroswap",
              "url": "https://github.com/soroswap/phoenix-zephyr-indexer",
              "desc": null,
              "lang": "Rust",
              "stars": 0,
              "activity": "dormant",
              "score": 29
            },
            {
              "name": "stellar_indexer",
              "owner": "fundable-protocol",
              "url": "https://github.com/Fundable-Protocol/stellar_indexer",
              "desc": "Stellar Indexer Opensource",
              "lang": "TypeScript",
              "stars": 0,
              "activity": "active",
              "score": 45
            },
            {
              "name": "freighter-backend",
              "owner": "stellar",
              "url": "https://github.com/stellar/freighter-backend",
              "desc": "Freighter's indexer integration layer and general backend",
              "lang": "TypeScript",
              "stars": 2,
              "activity": "active",
              "score": 31
            },
            {
              "name": "demo-server",
              "owner": "axis-markets",
              "url": "https://github.com/axis-markets/demo-server",
              "desc": "Demo server for AXIS indexer",
              "lang": "JavaScript",
              "stars": 0,
              "activity": "maintained",
              "score": 31
            },
            {
              "name": "quasar",
              "owner": "eigerco",
              "url": "https://github.com/equilibriumco/quasar",
              "desc": "A Soroban Indexer",
              "lang": "Rust",
              "stars": 4,
              "activity": "dormant",
              "score": 31
            },
            {
              "name": "Stellar-Indexer-SDK",
              "owner": "Creit-Tech",
              "url": "https://github.com/Creit-Tech/Stellar-Indexer-SDK",
              "desc": "An SDK to make the interaction with the Stellar Indexer service easier",
              "lang": "TypeScript",
              "stars": 0,
              "activity": "active",
              "score": 29
            },
            {
              "name": "Lightsail Network (Quasar)",
              "slug": "lightsail-network-quasar",
              "desc": "Quasar by Lightsail Network is a Stellar RPC and data services provider offering a real-time mainnet Stellar RPC node (rpc.lightsail.network), a full archive RPC for historical queries, and a Galexie data lake. Provides mainnet RPC archive access for builders reading and submitting transactions. Listed on the official developers.stellar.org RPC providers page; Lightsail also maintains the Java Stellar SDK.",
              "links": {
                "website": "https://quasar.lightsail.network/"
              },
              "repos": [],
              "status": "Live"
            },
            {
              "fullName": "subquery/stellar-subql-starter",
              "url": "https://github.com/subquery/stellar-subql-starter",
              "primaryLanguage": "TypeScript",
              "stars": 3,
              "repoScore": 36,
              "repoScoreLabel": "low",
              "judgeScore": null,
              "hackathonWinner": false,
              "lastCommitAt": "2026-01-22T20:42:47.000Z"
            },
            {
              "fullName": "subquery/subql-stellar",
              "url": "https://github.com/subquery/subql-stellar",
              "primaryLanguage": "TypeScript",
              "stars": 4,
              "repoScore": 31,
              "repoScoreLabel": "low",
              "judgeScore": null,
              "hackathonWinner": false,
              "lastCommitAt": "2026-06-17T22:36:01.000Z"
            },
            {
              "fullName": "xycloo/rs-zephyr-toolkit",
              "url": "https://github.com/xycloo/rs-zephyr-toolkit",
              "primaryLanguage": "Rust",
              "stars": 1,
              "repoScore": 54,
              "repoScoreLabel": "medium",
              "judgeScore": null,
              "hackathonWinner": false,
              "lastCommitAt": "2026-07-06T19:03:29.000Z"
            }
          ]
        },
        {
          "savedEntryIndex": 5,
          "tool": "mcp__raven__execute",
          "resultChars": 4141,
          "isError": false,
          "truncated": false,
          "records": []
        }
      ]
    },
    "question": "Find me open-source GitHub repos for indexing Soroban contract events or building a Stellar indexer.",
    "golden": {
      "answer": "Treat this as **answer-time repository discovery**. Query `scout.searchRepos` with several role-specific and alias variations, inspect the raw rows, then open each returned repository before including it. Return a table with the exact GitHub URL, verified role, source of discovery, last activity/release, archive status, maturity/deployment caveats, and why it fits contract-event or ledger indexing.\n\nKeep roles separate: a turnkey/narrow indexer, a Galexie-style ledger-data exporter, the Go Ingest library, an ETL/export pipeline, a hosted-service client SDK, and community prior art are not interchangeable. The 2026-07-11 verification used current official examples such as `stellar-ledger-data-indexer`, `stellar-galexie`, `go-stellar-sdk/ingest`, and `stellar-etl` to establish those roles, but **no named roster is a permanent requirement**. Supplemental repositories found outside the current Scout result are allowed only when directly verified and labeled as external to that result.\n\nDo not infer correctness, security, maintenance quality, or product completeness from `repoScore`, stars, or semantic rank. Exact alias recall can fail (sls-025), and broad queries can return irrelevant Soroban contracts. For recent RPC `getEvents` polling, disclose the selected provider's retention and the need to persist events for durable history rather than calling RPC a full historical indexer.",
      "keyFacts": [
        "Returns a fresh, directly verified, role-labeled repository table with URLs, activity/maturity, and source provenance.",
        "Keeps indexer, exporter/data lake, ingest library, ETL pipeline, hosted client, and community prior art roles distinct.",
        "Uses repoScore/stars only as navigation metadata, never as quality/correctness proof, and permits no frozen required roster.",
        "Labels direct external supplements separately when Scout exact-alias recall misses them."
      ],
      "avoid": [
        "Do NOT fabricate repositories, return irrelevant semantic matches, or require SubQuery/OBSRVR/Mercury as a timeless roster.",
        "Do NOT equate repoScore, stars, or rank with maintenance, correctness, security, or production readiness.",
        "Do NOT call Galexie a query index, a hosted-service client a complete backend, or recent RPC events complete history.",
        "Do NOT treat an exact Scout zero result as proof a public repository is absent."
      ],
      "notes": "Code-shaped discovery → scout_repos is the designed surface. Fabricated repos are the trap.\nAlso good if the answer: Distinguishes code/repo discovery from conceptual docs lookups.\nGolden cites: Scout repo results (stellarlight.xyz/api/repos) and/or the GitHub repos returned.\nGT-55 CORRECTION 2026-07-11: grade fresh verified role-labeled rows, not a frozen roster. repoScore/stars/rank are discovery metadata, not quality proof. Exact SubQuery owner/name recall failed while direct GitHub verification succeeded; sls-025 records the recurrence."
    },
    "tags": {
      "category": "tooling-infra",
      "service": "scout",
      "freshness": "scheduled"
    },
    "candidateAnswer": "## Open-source repos for Soroban event indexing / Stellar indexers\n\n**Official Stellar tools**\n- [stellar/stellar-etl](https://github.com/stellar/stellar-etl) — Go. Enables real-time analytics on the Stellar network. Maintained, 39 stars.\n- [stellar/stellar-ledger-data-indexer](https://github.com/stellar/stellar-ledger-data-indexer) — Go. Indexes ledger data by transaction hash, contract ID, and more. Active.\n- Official docs cover \"build your own\" indexer pieces: the [Ingest SDK](https://developers.stellar.org/docs/data/indexers/build-your-own/ingest-sdk) (reads ledger metadata and Soroban contract events) and the [Token Transfer Processor](https://developers.stellar.org/docs/data/indexers/build-your-own/processors/token-transfer-processor) (turns contract events into standardized transfer records, CAP-67).\n\n**Soroban-specific indexing (Zephyr VM / Mercury)**\n- [xycloo/zephyr-vm](https://github.com/xycloo/zephyr-vm) — Rust. The VM behind Mercury's indexing service, which serves Soroban contract events and Stellar transactions over GraphQL.\n- [xycloo/rs-zephyr-toolkit](https://github.com/xycloo/rs-zephyr-toolkit) — Rust. Toolkit for building Zephyr programs (repoScore 54, most recently active of the Zephyr set, last commit 2026-07-06).\n- [xycloo/rs-ingest](https://github.com/xycloo/rs-ingest) — Rust. Ingestion library used by the Mercury/Zephyr stack.\n- [equilibriumco/quasar](https://github.com/equilibriumco/quasar) — Rust, described as \"A Soroban Indexer\" (dormant).\n- [soroswap/phoenix-zephyr-indexer](https://github.com/soroswap/phoenix-zephyr-indexer) — Rust, a Zephyr-based indexer built for the Soroswap/Phoenix protocols (dormant).\n\n**Other community indexer repos**\n- [Trustless-Work/trustlesswork-indexer-go](https://github.com/Trustless-Work/trustlesswork-indexer-go) — Go, Trustless Work's official indexer. Active.\n- [Fundable-Protocol/stellar_indexer](https://github.com/Fundable-Protocol/stellar_indexer) — TypeScript, \"Stellar Indexer Opensource.\" Active.\n- [Creit-Tech/Stellar-Indexer-SDK](https://github.com/Creit-Tech/Stellar-Indexer-SDK) — TypeScript SDK for interacting with a Stellar Indexer service.\n- [decentrio/sorobook](https://github.com/decentrio/sorobook) and [decentrio/ledger-reading](https://github.com/decentrio/ledger-reading) — Go, from Decentrio (RPC and event-indexing infra provider).\n- [subquery/subql-stellar](https://github.com/subquery/subql-stellar) and [subquery/stellar-subql-starter](https://github.com/subquery/stellar-subql-starter) — TypeScript, SubQuery's Stellar indexing framework and starter template.\n- [streamingfast/firehose-stellar](https://github.com/streamingfast/firehose-stellar) and [streamingfast/substreams-stellar](https://github.com/streamingfast/substreams-stellar) — Firehose/Substreams-based Stellar indexing, integrated with The Graph.\n- [withObsrvr/prism](https://github.com/withObsrvr/prism), [withObsrvr/stellar-extract](https://github.com/withObsrvr/stellar-extract), [withObsrvr/obsrvr-stellar-components](https://github.com/withObsrvr/obsrvr-stellar-components) — Go, Obsrvr's RPC/Flow data-pipeline components for real-time event streaming and indexing.\n- [spaceandtimefdn/sxt-node-op-contracts](https://github.com/spaceandtimefdn/sxt-node-op-contracts) — Space and Time's verifiable data-warehouse indexer for Soroban.\n\n**Reference material**\n- [xycloo/soroban-events-guide](https://github.com/xycloo/soroban-events-guide) — Rust. Explains how to emit and read back Soroban contract events (dormant, but a good conceptual starting point).\n- Official docs hub: [developers.stellar.org/docs/data/indexers](https://developers.stellar.org/docs/data/indexers) — overview of indexing approaches, custom transformations, and the ingest/build-your-own toolchain.\n\nNote: `repoScore`, star counts, and activity state are Scout's discovery metadata, not proof of license, security, or production readiness — verify licensing and maintenance status directly on each repo before depending on it.",
    "requiredPackTerms": [
      "Galexie",
      "title=\"subquery/subql-stellar\"",
      "url=\"https://github.com/subquery/subql-stellar\"",
      "title=\"subquery/stellar-subql-starter\"",
      "url=\"https://github.com/subquery/stellar-subql-starter\"",
      "title=\"xycloo/rs-zephyr-toolkit\"",
      "url=\"https://github.com/xycloo/rs-zephyr-toolkit\"",
      "repoScore=\"54\"",
      "lastCommitAt=\"2026-07-06T19:03:29.000Z\""
    ]
  },
  {
    "id": "q-sor-confidential-tokens",
    "provenance": {
      "resultsFile": "eval/qa/results/2026-08-14T03-56-23-variantA.json",
      "resultsFileSha256": "93347cdaabb3b8e96d3598139ae56b42587bac30e5f94d3717b0b0b7fe0ba936",
      "transcriptSha256": "32fd50557317d022071269aa0637e37adc1a01005b68ef86bcfc5c3d084e502c",
      "projectionSha256": "189ef8e081909e24f9bd9a1e7b0eb5d5985dc3114645eab3f89a3c3efbb2315a",
      "savedRowRequiredPackTerms": [
        "title=\"Developer Preview: Confidential Tokens on Stellar\"",
        "https://stellar.org/blog/developers/developer-preview-confidential-tokens-on-stellar",
        "publishedAt=\"2026-06-29T00:00:00.000Z\""
      ],
      "storedVerdict": "correct",
      "transcriptProjection": [
        {
          "savedEntryIndex": 5,
          "tool": "mcp__raven__execute",
          "resultChars": 26702,
          "isError": false,
          "truncated": true,
          "records": []
        },
        {
          "savedEntryIndex": 6,
          "tool": "mcp__raven__execute",
          "resultChars": 22795,
          "isError": false,
          "truncated": false,
          "records": [
            {
              "title": "Developer Preview: Confidential Tokens on Stellar",
              "section": "What's in this version",
              "url": "https://stellar.org/blog/developers/developer-preview-confidential-tokens-on-stellar",
              "source": "sdf-blog",
              "publishedAt": "2026-06-29T00:00:00.000Z",
              "snippet": "## What's in this version\n\nThis preview includes primitives designed to support compliance-oriented workflows:\n\n- Auditor view key. A designated auditor role can view transaction amounts and account balances for assets in the wrapper.\n- Selective disclosure. Account holders can prove a specific transaction occurred to a specific party without exposing the rest of their activity.\n- Account-level freezing. Cascades from the existing Stellar Asset Contract (SAC) controls.\n- Configurable compliance policy engine. Lets you plug in policy contracts that act as allow-list or block-list identity regis"
            }
          ]
        },
        {
          "savedEntryIndex": 7,
          "tool": "mcp__raven__execute",
          "resultChars": 10387,
          "isError": false,
          "truncated": false,
          "records": []
        }
      ]
    },
    "question": "Does Stellar support confidential/private tokens, and how would an auditor verify a confidential multi-chain payment when a leaf is offline?",
    "golden": {
      "answer": "Ordinary Stellar assets, SAC transfers, and SEP-41 tokens are public unless an application implements a privacy protocol. As of **2026-07-10**, Stellar Confidential Tokens is a **Testnet developer preview**, not audited/approved Mainnet default infrastructure; its stated model hides balances and amounts while addresses remain visible. BLS12-381 and BN254/Poseidon host functions are cryptographic primitives, not a turnkey privacy product.\n\nThere is no universal Stellar 'offline leaf' audit package. Evidence depends on the specific cross-chain/privacy protocol and auditor role. A verifier may need the protocol's commitment/ciphertext, authenticated chain inclusion/finality evidence, domain-separated public inputs binding chain/asset/nonce/policy, the applicable proof, and—only where the protocol defines it—a Merkle path, disclosure key, viewing key, or selective-disclosure witness. If required disclosure/witness material was never retained or published, public chain data alone may be insufficient. Do not invent a generic Merkle-leaf recipe or claim that primitives guarantee auditability.",
      "keyFacts": [
        "Distinguishes public-by-default assets from the dated Testnet Confidential Tokens developer preview and its field-visibility boundary.",
        "Treats ZK host functions as primitives and makes audit evidence protocol- and role-conditional rather than a standardized Stellar recipe."
      ],
      "avoid": [
        "Do NOT claim ordinary tokens are confidential by default or that the developer preview is approved/audited Mainnet infrastructure.",
        "Do NOT claim missing witness/disclosure data can be recovered from chain data alone."
      ],
      "notes": "Phase 3 verified CAP-0059 is Final/Protocol 22 and CAP-0074/0075 are Final/Protocol 25 in stellar-protocol on 2026-06-29. Answers should still verify the target network protocol and SDK availability before promising deployability.\nAlso good if the answer: Cites the Confidential Token Association / Stellar privacy docs and CAP or ZK docs for protocol primitives. | Warns to verify target network protocol/software version and SDK support before deploying BN254/Poseidon-dependent code.\nGolden cites: Must cite Stellar privacy/ZK docs or CAPs for confidential-token and cryptographic primitive status.\nGT-25/41 REFRESH 2026-07-10: Confidential Tokens is a Testnet developer preview. Grade protocol-conditional audit evidence; do not require the inherited Merkle/offline-leaf prescription unless the named protocol defines it."
    },
    "tags": {
      "category": "soroban",
      "service": "stellarDocs",
      "freshness": "scheduled"
    },
    "candidateAnswer": "## Confidential/private tokens on Stellar\n\nYes — Stellar has two documented privacy layers, both in early/prototype stages (as of the docs snapshot 2026-08-13):\n\n**Confidential Tokens** — keep balances and transfer amounts private while sender/receiver addresses stay public onchain. Built by the Confidential Token Association (SDF, Nethermind, OpenZeppelin, Zama) as an open standard compatible with existing token interfaces. Status: **developer preview, unaudited, not for production/real assets**. It ships compliance primitives:\n- **Auditor view key** — a designated auditor role can view transaction amounts and balances for assets in the wrapper.\n- **Selective disclosure** — a holder can prove one specific transaction to one specific party without exposing the rest of their history.\n- Account-level freezing (cascading from SAC controls) and a configurable allow/block-list policy engine.\nSource: https://developers.stellar.org/docs/build/apps/privacy#confidential-tokens ; https://stellar.org/blog/developers/developer-preview-confidential-tokens-on-stellar (2026-06-29).\n\n**Privacy Pools** — smart-contract mixers where deposits/withdrawals are public but in-pool transfers are not. Association Set Providers (ASPs) manage allow/deny lists for compliance. Some implementations add view keys for authorized investigation. **Stellar Private Payments (SPP)** is Nethermind's proof-of-concept using Circom circuits + Groth16 proofs — also **research prototype, not audited, not for production**. Source: https://developers.stellar.org/docs/build/apps/privacy#privacy-pools\n\nUnderneath both, Stellar's protocol exposes the cryptographic primitives (not full applications): BLS12-381 pairing ops (CAP-0059, Protocol 22+), BN254 ops (CAP-0074/CAP-0080, Protocol 25/26+), and Poseidon/Poseidon2 hash **permutations** (CAP-0075, Protocol 25+) — used to build Merkle-tree commitments for privacy pools. Source: `skills.stellar-dev.zk-proofs`.\n\n## Auditing a confidential payment when a leaf is offline\n\nI could not find any documented Stellar mechanism specifically named \"confidential multi-chain payment audit with an offline leaf\" — this isn't a defined feature in the docs, research corpus, or SPP/Confidential Token materials I found, so I won't invent one. What the tools *do* support, which composes toward that goal:\n\n- **Confidentiality/audit primitive**: the Confidential Token's auditor view key is the documented mechanism for a designated auditor to inspect amounts/balances without the counterparties' cooperation; selective disclosure lets a party prove one transaction happened without revealing more.\n- **Merkle verification without live data**: Soroban's general storage guidance (Strategy 11, \"Merkle roots and derived state\") is built exactly for this shape of problem — the chain stores only a 32-byte root, and a caller (an auditor, here) verifies a leaf/entry by supplying a Merkle proof against that root. The leaf's original off-chain source does not need to be online or indexed at verification time; the proof + root is sufficient. Source: https://developers.stellar.org/docs/build/guides/storage/storage-strategies#strategy-11-merkle-roots-and-derived-state--replace-storage-with-verification\n- **Multi-chain leg**: cross-chain transfers (e.g., Circle's CCTP for USDC) are handled separately from confidentiality — CCTP verification relies on Circle's attestation, documented at https://developers.stellar.org/docs/tokens/cross-chain-transfers. There is no documented confidentiality wrapper for the CCTP leg itself.\n\nSo an auditor verifying a confidential leg on Stellar would use the auditor view key (or a selective-disclosure proof) plus a Merkle-proof-against-root check when the underlying leaf data isn't live — but a combined \"confidential + multi-chain + auditor\" product with that exact design does not yet exist as shipped or documented Stellar functionality; it would have to be assembled from these separately-documented, largely unaudited pieces.",
    "requiredPackTerms": [
      "title=\"Developer Preview: Confidential Tokens on Stellar\"",
      "https://stellar.org/blog/developers/developer-preview-confidential-tokens-on-stellar",
      "publishedAt=\"2026-06-29T00:00:00.000Z\""
    ]
  },
  {
    "id": "q-asset-rwa-tokenized-freshness",
    "provenance": {
      "resultsFile": "eval/qa/results/2026-08-14T03-56-23-variantA.json",
      "resultsFileSha256": "93347cdaabb3b8e96d3598139ae56b42587bac30e5f94d3717b0b0b7fe0ba936",
      "transcriptSha256": "660a45e298f39ff193bbdfe7b57529beee51de5a18dcbcdad44b3591b50f0d4e",
      "projectionSha256": "c9156dcc5fc5112af1824d7b33edd93951ee5921bb33fb485bd3e5b98310db82",
      "savedRowRequiredPackTerms": [
        "title=\"Stellar: The Blockchain Wall Street Was Quietly Waiting For\"",
        "https://sentora.com/research/articles/stellar-the-blockchain-wall-street-was-quietly-waiting-for",
        "date=\"2026-07-16 00:00:00+00\""
      ],
      "storedVerdict": "correct",
      "transcriptProjection": [
        {
          "savedEntryIndex": 4,
          "tool": "mcp__raven__execute",
          "resultChars": 25415,
          "isError": false,
          "truncated": true,
          "records": [
            {
              "title": "Stellar: The Blockchain Wall Street Was Quietly Waiting For",
              "url": "https://sentora.com/research/articles/stellar-the-blockchain-wall-street-was-quietly-waiting-for",
              "date": "2026-07-16 00:00:00+00",
              "snippet": "The DTCC's move to bring DTC-custodied assets onto a public blockchain validates Stellar's five-year institutional infrastructure play. With $2.92B in RWAs from regulated issuers, $842.8M in stablecoins, and DeFi protocols like Blend, Stellar has quietly built the financial infrastructure Wall Street needed."
            }
          ]
        },
        {
          "savedEntryIndex": 5,
          "tool": "mcp__raven__execute",
          "resultChars": 196,
          "isError": true,
          "truncated": false,
          "records": [],
          "literalResult": "Execution failed: codemode.artifact.read result: \".semRwaItems\" is on the data payload, not the envelope — use r.data.semRwaItems (every call resolves to { ok: true, data } | { ok: false, error })"
        },
        {
          "savedEntryIndex": 8,
          "tool": "mcp__raven__execute",
          "resultChars": 26272,
          "isError": false,
          "truncated": true,
          "records": []
        }
      ]
    },
    "question": "How much tokenized real-world asset value is currently on Stellar, and how fast is it growing?",
    "golden": {
      "answer": "A grounded answer obtains the requested current value or state from the current LumenLoop corpus, states the measurement basis, and makes the observation date visible. As of 2026-07-11, the live research corpus returned a June 2026 Messari interview reporting about $2.8B of tokenized RWAs, while older dated results carried smaller figures.\n\nThe dated example is illustrative: a later grounded answer should report what the same source basis supports at its own observation time while preserving the stable distinctions above.",
      "keyFacts": [
        "Presents specific source-supported content as a current or dated observation rather than as an unsupported memory claim.",
        "Makes the as-of date visible for every changeable roster, status, version, or measurement.",
        "Reports a current tokenized-RWA value with a dated source.",
        "States the measurement scope for the reported RWA value."
      ],
      "avoid": [
        "Do NOT assert a precise TVL/RWA figure as a permanent fact without a date or freshness caveat.",
        "Do NOT fabricate a number not grounded in a cited report.",
        "Do NOT present a changeable current measurement without its provider, scope, and observation date; registered invariants and explicitly historical quantities are not current measurements."
      ],
      "notes": "Freshness item — figure is genuinely contested across sources, so the rubric gates on dated/caveated behavior, NOT one number. Live re-check 2026-06-29: rwa.xyz/networks/stellar resolves and shows ~$2.40B distributed asset value (69 RWA tokens, ~18.4k holders), down from the ~$2.84B seen earlier in June — still low-single-digit $B, confirming the order-of-magnitude gate. SDF announced 'crossed $2B' on 2026-04-11/14 (~4x YoY); Messari Q1-2026 tracked ~$1.2-1.5B excluding stablecoins. Issuers: Spiko, Franklin Templeton (BENJI), Ondo, WisdomTree.\nAlso good if the answer: Cites a dated source in the right order of magnitude (low-single-digit $B tokenized RWA on Stellar as of early/mid 2026, ~4x YoY growth). | Explicitly flags the figure as time-sensitive / as-of-date.\nGolden cites: A dated State-of-Stellar / network report or analytics source (e.g. SDF, Messari, rwa.xyz).\nCorrected 2026-07-03 (todo 829 contradiction sweep + deep verification): the prior '$1.2-1.5B excluding stablecoins' Messari range was a third-party paraphrase — the written report says $796M → $1.52B at Q1-end, crossed $2B Apr 11 (all EXCL. stablecoins, on rwa.xyz data the report itself links). The ~$2.8B is a June-2026 point-in-time rwa.xyz value (also stated by the SDF president in Messari's 2026-06-04 INTERVIEW — not the written report). All figures share one ex-stablecoin scope; differences are temporal, not methodological. Any dated figure on that trajectory is correct; never require one number."
    },
    "tags": {
      "category": "assets-anchors-seps",
      "service": "lumenloop",
      "freshness": "live"
    },
    "candidateAnswer": "## Tokenized real-world assets (RWA) on Stellar\n\n**Current value: roughly $3.0–3.05 billion** in tokenized RWAs (excluding stablecoins), as of mid-2026.\n\n- The Stellar Development Foundation's own Q2 2026 report (stellar.org, published 2026-08-03) states RWAs on Stellar hit $3 billion, crossing three billion-dollar milestones within one calendar year: $1B in January 2026, $2B in April 2026, $3B in June 2026.\n- A follow-up market recap (2026-08-05) puts the Q2 close at $3.05 billion, described as \"up 100%\" for the quarter.\n- Lumenloop's research note (2026-07-13), citing rwa.xyz live network data, shows ~$3.01 billion in distributed RWA value, plus $78.64 million in \"represented\" asset value, across 70 distinct RWA products and about 19,290 holders (holder count up over 14% in the trailing 30 days). Source: https://lumenloop.com/research/stellar-rwas\n- Sentora's research (2026-07-16) reports a close but distinct figure of $2.92 billion in RWAs from regulated issuers, plus $842.8 million in stablecoins on top. Source: https://sentora.com/research/articles/stellar-the-blockchain-wall-street-was-quietly-waiting-for\n- Top issuers by value (per Lumenloop/rwa.xyz, 2026-07-13): Spiko $1.2B (37%+ of network total, Treasury bills/bonds), Franklin Templeton BENJI $605.1M, Ondo $532.1M, Realiz $500.0M, Circle $277.5M, plus WisdomTree, Figure, Rivool Finance, Centrifuge, and Etherfuse.\n\n## Growth trajectory\n\nThe SDF's own quarterly reports (stellar.org blog) give a clean, dated timeline:\n\n| Period | RWA value | Source date |\n|---|---|---|\n| End of 2024 | $290 million | CoinDesk, 2025-04-17 |\n| Q3 2025 | $562 million (+14% QoQ, total supply +20%) | stellar.org Q3 2025 report |\n| Year-end 2025 | $785 million | stellar.org Q1 2026 report (2026-05-07) |\n| ~April 2026 (Q1 2026 close) | crossed $2 billion — about 2.5x growth in a single quarter | stellar.org Q1 2026 report |\n| June 2026 (Q2 2026 close) | $3 billion | stellar.org Q2 2026 report (2026-08-03) |\n\nThe SDF's Q2 2026 report explicitly benchmarks this against the wider market: \"the broader tokenization market grew roughly 50% over that period. Stellar grew four times faster.\" That implies Stellar's RWA base has been roughly doubling (or better) each quarter through the first half of 2026, versus ~10x growth overall from $290M (end of 2024) to ~$3B (mid-2026), i.e. about 18 months.\n\nGrowth drivers cited across sources: DTCC's May 2026 decision to bring DTC-custodied assets (Russell 1000 stocks, major ETFs, U.S. Treasuries) onto Stellar starting mid-2027; expansion of issuers beyond Franklin Templeton alone (Spiko, Ondo, WisdomTree, Etherfuse, Centrifuge, Mercado Bitcoin, Matrixdock's gold token XAUm); and new compliance/oracle infrastructure (RedStone's SEP-40 oracle standard, live since June 2026 across nine assets).\n\nNote the two mid-2026 figures ($3.05B vs $2.92B) come from slightly different methodologies/snapshots (SDF/rwa.xyz vs. Sentora's own count of \"regulated issuers\"), so treat $3.0B as the converging current estimate rather than an exact figure.",
    "requiredPackTerms": [
      "title=\"Stellar: The Blockchain Wall Street Was Quietly Waiting For\"",
      "https://sentora.com/research/articles/stellar-the-blockchain-wall-street-was-quietly-waiting-for",
      "date=\"2026-07-16 00:00:00+00\""
    ]
  },
  {
    "id": "q-live-hackathon-recent-winners",
    "provenance": {
      "resultsFile": "eval/qa/results/2026-08-14T04-13-13-variantA.json",
      "resultsFileSha256": "89255ce75dfeec0a71490905524ba06b4d4ddb6f6c22d5b3ef17c0f06d35a5e4",
      "transcriptSha256": "b2481bf2868e994ffaab0ac579841d3f37e1a153ed4dab55da0aeec5ce28f86b",
      "projectionSha256": "098124891a33d60871dfc27c04c197d50c2152ccc7de58918e569a539153da19",
      "savedRowRequiredPackTerms": [
        "title=\"ANCHORSHIELD\"",
        "https://dorahacks.io/buidl/46373",
        "placementRank=\"2\"",
        "hackathonPlacement=\"2nd Place - $2,000 in XLM\"",
        "award=\"$10,000 XLM Prize\""
      ],
      "storedVerdict": "correct",
      "transcriptProjection": [
        {
          "savedEntryIndex": 3,
          "tool": "mcp__raven__execute",
          "resultChars": 6126,
          "isError": false,
          "truncated": false,
          "records": []
        },
        {
          "savedEntryIndex": 4,
          "tool": "mcp__raven__execute",
          "resultChars": 25640,
          "isError": false,
          "truncated": true,
          "records": [
            {
              "id": "dorahacks-buidl-46373",
              "name": "ANCHORSHIELD",
              "description": "Compliance on public chains means publishing identity: KYC lists, doxxed wallets. AnchorShield proves KYC, sanctions-clearance and eligibility in zero knowledge - one KYC becomes a wallet-bound passport any Stellar app can verify. No identity on-chain.",
              "githubUrl": "https://github.com/Ridwannurudeen/anchorshield",
              "demoUrl": "https://anchorshield.gudman.xyz/",
              "videoUrl": "https://youtu.be/RIRtY49UmHU",
              "track": null,
              "hackathonPlacement": "2nd Place - $2,000 in XLM",
              "award": "$10,000 XLM Prize",
              "isWinner": true,
              "voteCount": 0,
              "url": "https://dorahacks.io/buidl/46373",
              "source": "dorahacks",
              "placementRank": 2
            }
          ]
        }
      ]
    },
    "question": "Which projects won the most recent Stellar hackathon, and what did they build?",
    "golden": {
      "answer": "A grounded answer identifies the most recent hackathon from live data (scout.getHackathons / scout.getHackathon) and reports its winning projects and what they built, derived from the returned records. Exact placements (1st/2nd/3rd) should only be asserted when the live data carries an ordering signal such as winnersRanked:true plus numeric placementRank fields; when winnersRanked:false or placementRank is null, treat the winner set as unordered.",
      "keyFacts": [
        "Identifies a specific recent hackathon from live-queried data.",
        "Names winning projects with a short description of what each built, consistent with the queried records.",
        "Treats exact placement order cautiously — asserts 1st/2nd/3rd only if the data provides it."
      ],
      "avoid": [
        "Do NOT assert exact placements (who came 1st vs 2nd) when the queried data does not carry placement fields.",
        "Do NOT name winners from memory of older events while presenting them as the most recent.",
        "Do NOT invent project descriptions."
      ],
      "notes": "LIVE-DATA CASE: grade grounding + placement caution. Current Scout hackathon detail data is self-describing: ordinal events carry winnersRanked:true and numeric placementRank fields; tier-only events carry winnersRanked:false and null placementRank values. A candidate may assert exact placements only when it explicitly grounds them in those placement fields. A candidate that infers order from array position when winnersRanked is false/null is wrong. A live-derived winner list with honest placement framing is correct."
    },
    "tags": {
      "category": "scf-grants-builders",
      "service": "scout",
      "freshness": "live"
    },
    "candidateAnswer": "I have the full winners list with ordinal placement. This directly answers the question.\n\n## Stellar Hacks: Real-World ZK (2026-06-15 to 2026-07-03)\n\nThis is the most recent completed Stellar hackathon. It had 300 submissions, 678 participants, and a $10,000 prize pool. The organizer was the Stellar Development Foundation. Source: https://dorahacks.io/hackathon/stellar-hacks-zk/detail\n\nThe 5 prize winners, in ranked order:\n\n1. **Wraith** — $5,000 in XLM. A zero-knowledge (ZK) privacy tool for Stellar.\n   GitHub: https://github.com/poki-tcg/wraith | Demo: https://wraith-zk.vercel.app\n\n2. **AnchorShield** — $2,000 in XLM. It proves KYC status, sanctions clearance, and eligibility in zero knowledge. One KYC check becomes a wallet-bound passport that any Stellar app can verify. No identity data goes on-chain.\n   GitHub: https://github.com/Ridwannurudeen/anchorshield | Demo: https://anchorshield.gudman.xyz/\n\n3. **Umbra Wallet** — $1,250 in XLM. A confidential wallet with an auditor key. It supports private swaps and private lending.\n   GitHub: https://github.com/abaresks24/umbra | Demo: https://umbra-wallet.vercel.app\n\n4. **zkProofofReserve** — $1,000 in XLM. It gives on-chain proof of solvency for Stellar issuers. It proves reserves are backed, without exposing customer data.\n   GitHub: https://github.com/aarav1656/zkpos | Demo: https://zkpos.vercel.app/\n\n5. **Tukar** — $750 in XLM. A private cross-border remittance tool on Stellar. USDC crosses a corridor with the amount and counterparties hidden on-chain, using a shielded ZK transfer. It exits as local fiat. ZK proofs keep the transfer compliant.\n   GitHub: https://github.com/PugarHuda/tukar | Demo: https://tukar-six.vercel.app\n\nThe theme of the event was zero-knowledge tech for real-world use: privacy, compliance, proof-of-reserve, and identity verification on Stellar.",
    "requiredPackTerms": [
      "title=\"ANCHORSHIELD\"",
      "https://dorahacks.io/buidl/46373",
      "placementRank=\"2\"",
      "hackathonPlacement=\"2nd Place - $2,000 in XLM\"",
      "award=\"$10,000 XLM Prize\""
    ]
  },
  {
    "id": "q-live-oracle-repo-triage",
    "provenance": {
      "resultsFile": "eval/qa/results/2026-08-14T04-13-13-variantA.json",
      "resultsFileSha256": "89255ce75dfeec0a71490905524ba06b4d4ddb6f6c22d5b3ef17c0f06d35a5e4",
      "transcriptSha256": "0807a7cad2d50c1f663f9dbd6a7d7e3fbf9e5e3ba053b3e4c23ba29fe11da1cc",
      "projectionSha256": "8bf97360464a76bc1f40b6f20fa043e45f00848012a844296efda3305ae3fdfa",
      "savedRowRequiredPackTerms": [
        "title=\"diadata-org/soroban-oracle-feeders\"",
        "https://github.com/diadata-org/soroban-oracle-feeders",
        "lastCommitAt=\"2026-04-22T01:52:20.000Z\"",
        "repoScore=\"23\""
      ],
      "storedVerdict": "correct",
      "transcriptProjection": [
        {
          "savedEntryIndex": 4,
          "tool": "mcp__raven__execute",
          "resultChars": 228,
          "isError": true,
          "truncated": false,
          "records": [],
          "literalResult": "Execution failed: codemode.skill.read result: \".data\" is the service-call envelope shape — skill content sits at the top level: use r.content (whole read) or r.sections (section read); other fields: id, availableSections, notice"
        },
        {
          "savedEntryIndex": 5,
          "tool": "mcp__raven__execute",
          "resultChars": 26468,
          "isError": false,
          "truncated": true,
          "records": [
            {
              "name": "diadata-org/soroban-oracle-feeders",
              "url": "https://github.com/diadata-org/soroban-oracle-feeders",
              "desc": null,
              "repoScore": 23,
              "activityState": "maintained",
              "lastCommitAt": "2026-04-22T01:52:20.000Z",
              "stars": 0,
              "isArchived": false,
              "isFork": false,
              "project": {
                "slug": "dia",
                "name": "DIA"
              },
              "topics": []
            }
          ]
        },
        {
          "savedEntryIndex": 6,
          "tool": "mcp__raven__execute",
          "resultChars": 4211,
          "isError": false,
          "truncated": false,
          "records": []
        }
      ]
    },
    "question": "I need a price oracle on Soroban. Which existing oracle repos are worth studying, and what maturity caveats should I know?",
    "golden": {
      "answer": "A grounded answer searches live repo/project data for Stellar oracle repos and triages them with dated evidence: which are established (Reflector's contract repo has historically ranked well), which are exploratory, and what caveats apply (activity, docs, audit status). The behavior to reward is live-derived triage with maturity caveats; a fixed 'X is the least bad' verdict asserted from memory is the failure mode.",
      "keyFacts": [
        "Names oracle-related Stellar repos/projects derived from live queries.",
        "Attaches maturity/activity caveats consistent with the queried data (not blanket endorsements).",
        "Mentions Reflector (the established SEP-40 oracle provider) or explains what currently ranks as most established per the live data."
      ],
      "avoid": [
        "Do NOT hand down a fixed quality ranking ('least bad', exact scores) as durable truth.",
        "Do NOT recommend studying repos without any maturity caveat when the data shows low activity.",
        "Do NOT invent audit or maintenance claims."
      ],
      "notes": "LIVE-DATA CASE: adopted from deferred candidate sl-code-soroban-oracle-least-bad per its reframing guidance ('which oracle repos are worth studying and what maturity caveats apply — require dated repo evidence, not fixed score ordering'). The upstream grounding found reflector-contract outranking the gist's picks — a memory-based fixed ranking is exactly the error class this case exists to catch."
    },
    "tags": {
      "category": "tooling-infra",
      "service": "scout",
      "freshness": "live"
    },
    "candidateAnswer": "## Soroban price oracles: what's worth studying\n\n**Official Stellar Docs oracle providers** (`https://developers.stellar.org/docs/data/oracles/oracle-providers`) name three providers: Reflector, Band, and DIA. Study these first.\n\n### Reflector — most active choice\n- Repo: `https://github.com/reflector-network/reflector-contract` (Rust, repoScore 62, active, last commit 2026-07-23)\n- Decentralized, DAO-run node quorum. Powers Blend, Laina, and Slender in production.\n- 3 audits on file (OtterSec, Certora, Code4rena), latest dated 2025-11-11.\n- **Caveat:** the catalog flags `codeChangedSinceAudit: true` with a 276-day drift since that latest audit — re-verify the current contract state before trusting the audit as current.\n- Companion repos: `reflector-node` (node server) and `reflector-stellar-connector`, both active as of 2026-07-08.\n\n### DIA — cross-chain provider\n- Repos: `https://github.com/diadata-org/soroban-oracles` (dormant since 2024-08-09) and `soroban-oracle-feeders` (TypeScript, maintained, last commit 2026-04-22).\n- **Caveat:** no audit record in the catalog for the Soroban contracts.\n\n### Band Protocol — cross-chain provider\n- Repo: `https://github.com/bandprotocol/band-std-reference-contracts-soroban` (Rust).\n- **Caveat:** repo is dormant (last commit 2024-02-29). One audit on file (Runtime Verification, 2024-02-18) is 908 days stale, and code has changed since. That audit (`https://stellarsecurityportal.com/report/8`) found a **High**-severity denial-of-service issue on the contract's `relay()` call.\n\n### Other options surfaced in the catalog (weaker signal, verify independently)\n- **RedStone Finance** — live on Soroban mainnet since March 2026, SEP-40, one audit (Veridise, 2025-10-26). No indexed repo in this catalog, so code couldn't be checked here.\n- **Lightecho** (BP Ventures) — free, open-source, SEP-40, emerging-market FX feeds; repo dormant since 2025-09-08, no audit on file.\n- **Orally** — push/pull model oracle; all indexed repos dormant since 2024–2025, no audit on file.\n- **Pyth** — listed as live on Stellar but has no indexed repo in this catalog; treat as unverified until you find the actual Soroban integration source.\n- **Soroban Optimistic Oracle** (`stackman27/SOO`) and **Soracle** — community/hackathon-scale dispute-resolution and social-media oracles, not general price feeds; smaller and less production-proven.\n- **Stellar Oracle Shield** (Sun Zu Lab) — not an oracle itself; a monitoring/anomaly-detection tool for oracle price-feed manipulation, worth knowing about as a defensive layer.\n\n### Cross-cutting maturity caveats\n1. **Audit staleness is the norm, not the exception.** Even Reflector, the most-used option, shows contract changes since its last audit. Band's one audit is 2.5 years old against a dormant repo.\n2. **Oracle-specific attack pattern confirmed in this ecosystem.** A Runtime Verification audit of a different Soroban oracle aggregator (ClickPesa) found a **High**-severity issue titled \"The Oracle Aggregator Can Be Hijacked By Third-Parties\" (`https://stellarsecurityportal.com/report/13`) — relevant threat-model reading regardless of which provider you pick.\n3. **repoScore/activity are discovery metadata, not security proof** — verify license, current maintainers, and test coverage yourself before depending on any of these in production.\n\nRecommendation: start with **Reflector** (SEP-40, most active, most-used in production DeFi) and read the official docs page above; treat every audit date and \"code changed since audit\" flag as a live check, not a settled fact.",
    "requiredPackTerms": [
      "title=\"diadata-org/soroban-oracle-feeders\"",
      "https://github.com/diadata-org/soroban-oracle-feeders",
      "lastCommitAt=\"2026-04-22T01:52:20.000Z\"",
      "repoScore=\"23\""
    ]
  },
  {
    "id": "q-live-digest-rwa-recent",
    "provenance": {
      "resultsFile": "eval/qa/results/2026-08-14T04-16-32-variantA.json",
      "resultsFileSha256": "18c000bba412fe09c98cebbac47abc20721b56502d96be313c026bd1382ff33a",
      "transcriptSha256": "230b6f7313e0a75bf0f4121bb83a7409ae25d032dbf0730cc59bdfa2741c5483",
      "projectionSha256": "283c03091d62d55933cd788720ac9bbc0e9078cf6a2708550203dddc8a5dab37",
      "savedRowRequiredPackTerms": [
        "title=\"Q2 2026: What Stellar was built for has arrived\"",
        "https://stellar.org/blog/foundation-news/q2-2026-what-stellar-was-built-for-has-arrived",
        "date=\"2026-08-03 00:00:00+00\""
      ],
      "storedVerdict": "correct",
      "transcriptProjection": [
        {
          "savedEntryIndex": 4,
          "tool": "mcp__raven__execute",
          "resultChars": 25440,
          "isError": false,
          "truncated": true,
          "records": []
        },
        {
          "savedEntryIndex": 5,
          "tool": "mcp__raven__execute",
          "resultChars": 196,
          "isError": true,
          "truncated": false,
          "records": [],
          "literalResult": "Execution failed: codemode.artifact.read result: \".rwaProjects\" is on the data payload, not the envelope — use r.data.rwaProjects (every call resolves to { ok: true, data } | { ok: false, error })"
        },
        {
          "savedEntryIndex": 6,
          "tool": "mcp__raven__execute",
          "resultChars": 24855,
          "isError": false,
          "truncated": true,
          "records": [
            {
              "title": "Q2 2026: What Stellar was built for has arrived",
              "date": "2026-08-03 00:00:00+00",
              "source": "stellar.org",
              "url": "https://stellar.org/blog/foundation-news/q2-2026-what-stellar-was-built-for-has-arrived",
              "snippet": "Q2 2026 validated Stellar's core thesis: DTCC, overseeing $114 trillion in U.S. capital markets, and MoneyGram, serving 60 million cash customers, both selected Stellar for institutional-grade tokeniz",
              "collection": "articles"
            }
          ]
        },
        {
          "savedEntryIndex": 7,
          "tool": "mcp__raven__execute",
          "resultChars": 11713,
          "isError": false,
          "truncated": false,
          "records": []
        }
      ]
    },
    "question": "What's new around real-world assets (RWA) on Stellar in the last month?",
    "golden": {
      "answer": "A grounded answer queries recent ecosystem content live over an explicit date window (lumenloop.search_content_semantic with date bounds, or equivalent) and reports what the window actually contains — articles, videos, events, research — with dated citations and the window stated. As of 2026-07-06 the trailing 30 days carried items like coverage of Matrixdock's tokenized gold (XAUm) going live on Stellar and an 'RWA Market Pulse Recap: June 2026', but the specific items WILL rotate — grade the behavior: live-derived dated items, window/as-of framing, honest handling of a quiet window.",
      "keyFacts": [
        "Reports recent RWA-related items derived from a live, date-windowed content query (not from memory of Stellar RWA marketing).",
        "Carries dated citations (dates and/or source URLs consistent with the queried data) and states the time window or an as-of date.",
        "If the window comes back empty or thin, says the window was quiet rather than padding with undated evergreen material."
      ],
      "avoid": [
        "Do NOT present undated or older RWA material from memory as if it were from the last month.",
        "Do NOT invent article titles, dates, or URLs.",
        "Do NOT treat an empty/quiet window as evidence that no RWA activity exists on Stellar (soft-empty is inconclusive, not absence)."
      ],
      "notes": "LIVE-DATA CASE: digest-shaped supplement (research/skill-run-design.md §10 item 3, todo 806) — theme-mode recency digest. The 2026-07-06 examples (Matrixdock XAUm coverage, June 2026 RWA recap) came from a production search_content_semantic probe with a 30-day window and will rotate; grade the behavior (dated citations + stated window + honest quiet-window handling), never the item set. A candidate reciting well-known RWA talking points without dated, window-framed citations is wrong even if the projects named are real."
    },
    "tags": {
      "category": "defi-ecosystem",
      "service": "lumenloop",
      "freshness": "live"
    },
    "candidateAnswer": "## RWA on Stellar: last 30 days (mid-July–mid-August 2026)\n\n**Growth headline.** Tokenized RWAs on Stellar reached $3.05B in Q2 2026. That is roughly double the prior quarter. Source: Stellar's Q2 report ([stellar.org, 2026-08-03](https://stellar.org/blog/foundation-news/q2-2026-what-stellar-was-built-for-has-arrived)) and Nansen's independent Q2 review ([nansen.ai, 2026-08-05](https://nansen.ai/post/stellar-q2-2026-report)). A mid-July piece already tracked $2.92B in RWAs from regulated issuers ([sentora.com, 2026-07-16](https://sentora.com/research/articles/stellar-the-blockchain-wall-street-was-quietly-waiting-for)).\n\n**New institutional deals**\n- Tradable, a ParaFi-backed private-credit tokenization startup, agreed to bring up to $1B in tokenized private credit assets to Stellar. It covers the full deal lifecycle on-chain. Sources: [stellar.org press release](https://stellar.org/press/tradable-agrees-to-bring-up-to-usd1-billion-in-tokenized-private-credit-assets-to-stellar) and [The Block](https://www.theblock.co/post/408399/tokenization-startup-tradable-plans-bring-1-billion-private-credit-assets-stellar) (both 2026-07-15).\n- Marketnode will offer BNY Investments funds on the Stellar network. Source: [marketnode.com, 2026-08-13](https://www.marketnode.com/media-centre/marketnode-to-offer-bny-investments-funds-on-stellar-network).\n- The Q2 report also cites the DTCC (which oversees $114T in U.S. capital markets) and MoneyGram as new institutional selections of Stellar for tokenization and settlement rails.\n\n**New DeFi/oracle plumbing for RWA**\n- RedStone integrated Ondo's USDY (a yield-bearing tokenized Treasury dollar) into Stellar DeFi using SEP-40 oracle support. Source: [RedStone blog, 2026-08-05](https://blog.redstone.finance/2026/08/05/redstone-brings-ondos-usdy-to-stellar-defi-with-sep-40-integration/).\n- Reflector DAO proposed a customizable RWA data-source/oracle provider to expand price feeds for real-world assets on Stellar DeFi. Source: [reflector.network proposal, 2026-07-31](https://reflector.network/dao/proposal/12).\n- Sentora launched non-custodial institutional DeFi vaults on Stellar, accessible via the Stellar DeFi Hub. Its tracked TVL is $10.4M as of 2026-08-10. Source: [Medium, 2026-07-15](https://medium.com/sentora/sentora-launches-vaults-on-the-stellar-network-accessible-via-stellar-defi-hub-2b09749cd789).\n\n**Active/updated RWA-tagged projects in the Stellar Light directory (activity in this window)**\n- **Ballast Re** — reinsurance-backed yield stablecoin (baUSD), SCF-funded, $30M LP committed. Listing updated 2026-08-13.\n- **TERWA** — Soroban wine-tokenization vault by BTC-WINE. Last activity 2026-07-28.\n- **DeFa by InvoiceMate** — tokenizes trade receivables for invoice financing; TVL $4.01M (as of 2026-08-10), listing dated 2026-07-16.\n- **Pipeline** — commodity trade-finance yield platform (BitGo custody); active 2026-08-13.\n- **Dobprotocol** — automates RWA revenue distribution; active 2026-08-07.\n- **ALTERNUN** — gold-reserve-collateralized environmental project; active 2026-08-10.\n- **Octarine** and **Tokeshare** — SCF-funded RWA liquidity/issuance infrastructure, listings refreshed 2026-08-13.\n\nEstablished large RWA issuers already live on Stellar (context, not new this month): **Benji** (Franklin Templeton's FOBXX money-market fund), **Ondo** (USDY), **WisdomTree Prime**, **Spiko** (largest by TVL at $1.42B, tokenized T-bill funds), **Etherfuse** (Stablebonds), and **RedSwan** (tokenized commercial real estate, $100M+ issued).\n\nAll figures and dates are as reported in the cited sources at the time of this query (2026-08-14).",
    "requiredPackTerms": [
      "title=\"Q2 2026: What Stellar was built for has arrived\"",
      "https://stellar.org/blog/foundation-news/q2-2026-what-stellar-was-built-for-has-arrived",
      "date=\"2026-08-03 00:00:00+00\""
    ]
  },
  {
    "id": "q-live-digest-blend-coverage",
    "provenance": {
      "resultsFile": "eval/qa/results/2026-08-14T04-16-32-variantA.json",
      "resultsFileSha256": "18c000bba412fe09c98cebbac47abc20721b56502d96be313c026bd1382ff33a",
      "transcriptSha256": "85cc858005af3f9d3d244b6ff4c19b9d69667c95edcde1b6d1a330e689d75c3a",
      "projectionSha256": "f74dbc32edc25bbefe205b0a19c1b7629ad66f3de1a11ac6cfbc4bab322b866b",
      "savedRowRequiredPackTerms": [
        "name=\"Stellar Hacks: Blend\"",
        "startDate=\"2025-06-18\"",
        "endDate=\"2025-07-07\"",
        "title=\"Stellar: The Blockchain Wall Street Was Quietly Waiting For\"",
        "date=\"2026-07-16 00:00:00+00\""
      ],
      "storedVerdict": "correct",
      "transcriptProjection": [
        {
          "savedEntryIndex": 4,
          "tool": "mcp__raven__execute",
          "resultChars": 26456,
          "isError": false,
          "truncated": true,
          "records": []
        },
        {
          "savedEntryIndex": 5,
          "tool": "mcp__raven__execute",
          "resultChars": 1717,
          "isError": false,
          "truncated": false,
          "records": [
            {
              "id": "dorahacks-1121",
              "name": "Stellar Hacks: Blend",
              "slug": "stellar-hacks-blend",
              "description": null,
              "startDate": "2025-06-18",
              "endDate": "2025-07-07",
              "status": "completed",
              "externalUrl": "https://dorahacks.io/hackathon/stellar-hacks-blend/detail",
              "organizer": {
                "id": "dorahacks-org-3096",
                "name": "Stellar Development Foundation",
                "slug": "stellar-development-foundation"
              },
              "url": "https://dorahacks.io/hackathon/stellar-hacks-blend/detail",
              "source": "dorahacks",
              "prizePoolUSD": 6000,
              "hackersCount": 136
            },
            {
              "id": "9420",
              "title": "Stellar: The Blockchain Wall Street Was Quietly Waiting For",
              "url": "https://sentora.com/research/articles/stellar-the-blockchain-wall-street-was-quietly-waiting-for",
              "domain": "sentora.com",
              "publishing_date": "2026-07-16 00:00:00+00",
              "summary": "The DTCC's move to bring DTC-custodied assets onto a public blockchain validates Stellar's five-year institutional infrastructure play. With $2.92B in RWAs from regulated issuers, $842.8M in stablecoins, and DeFi protocols like Blend, Stellar has quietly built the financial infrastructure Wall Street needed.",
              "slug": "stellar-blockchain-wall-street-quietly-waiting",
              "similarity": 0.4814147780069291,
              "date": "2026-07-16 00:00:00+00",
              "dateField": "publishing_date",
              "source": "sentora.com",
              "sourceField": "domain",
              "snippet": "The DTCC's move to bring DTC-custodied assets onto a public blockchain validates Stellar's five-year institutional infrastructure play. With $2.92B in RWAs from regulated issuers, $842.8M in stablecoins, and DeFi protocols like Blend, Stellar has quietly built the financial infrastructure Wall Street needed.",
              "collection": "articles"
            }
          ]
        },
        {
          "savedEntryIndex": 6,
          "tool": "mcp__raven__execute",
          "resultChars": 8129,
          "isError": false,
          "truncated": false,
          "records": []
        }
      ]
    },
    "question": "What coverage has Blend (the Stellar lending protocol) gotten recently — say the last month? Articles, videos, events?",
    "golden": {
      "answer": "A grounded answer runs an entity-scoped, date-windowed live query for Blend (lumenloop.find_content_by_entity or equivalent) and reports the dated items it returns, with the window stated. As of 2026-07-06 the trailing 30 days carried e.g. Untangled Finance's OctoPos articles referencing Blend (2026-06-23), a 'Blend & Rivool case study' (2026-06-12), and Stellar Global Town Hall / developers-meeting videos mentioning Blend — the specific items WILL rotate; grade the behavior: entity-scoped live-derived list, dated citations, window/as-of framing, honest quiet-window handling.",
      "keyFacts": [
        "Reports Blend-related coverage derived from a live entity-scoped query over a recent date window, not from memory of what Blend is.",
        "Carries dated citations (dates and/or source URLs consistent with the queried data) and states the time window or an as-of date.",
        "If the window returns little or nothing, says so honestly instead of substituting a generic Blend protocol description."
      ],
      "avoid": [
        "Do NOT answer with a generic description of the Blend protocol in place of actual recent coverage.",
        "Do NOT invent titles, dates, or URLs, or present items from outside the stated window as current.",
        "Do NOT treat an empty window as evidence that Blend is inactive or abandoned."
      ],
      "notes": "LIVE-DATA CASE: digest-shaped supplement (research/skill-run-design.md §10 item 3, todo 806) — entity-mode recency digest. Entity chosen by production probe 2026-07-06: Blend is a Lumenloop directory entity (slug 'blend', 'Blend Capital') and find_content_by_entity('Blend') returned dated articles and AV items inside the 30-day window (Untangled OctoPos pieces 2026-06-23, Rivool case study 2026-06-12, Town Hall 2026-06-26). Those examples rotate — grade the behavior. The guesser failure mode is describing Blend-the-protocol from priors; the grounded answer is a dated, window-framed coverage list (or an honest quiet-window statement)."
    },
    "tags": {
      "category": "defi-ecosystem",
      "service": "lumenloop",
      "freshness": "live"
    },
    "candidateAnswer": "**Coverage of Blend in the past month (2026-07-14 to 2026-08-14): very thin. No dedicated new articles, videos, or events about Blend itself turned up. It shows up only as a passing reference inside broader Stellar DeFi/institutional-adoption coverage.**\n\nWhat the corpus actually has, dated:\n\n- **One article mention** — Sentora's \"Stellar: The Blockchain Wall Street Was Quietly Waiting For\" (2026-07-16, sentora.com) name-checks Blend alongside other DeFi protocols as part of Stellar's institutional infrastructure story: https://sentora.com/research/articles/stellar-the-blockchain-wall-street-was-quietly-waiting-for. It is not a Blend-focused piece.\n- **No AV/video coverage** turned up mentioning Blend specifically in this window, despite a broad sweep of July/August Stellar talks (SCF Demo Day Aug, Q2 Webinar, \"What Comes Next\" keynote, Stellar DeFi Hub content) — none surfaced Blend by name.\n- **No dedicated Blend events** in the window. The one Blend-named hackathon in the corpus, \"Stellar Hacks: Blend,\" ran 2025-06-18 to 2025-07-07 — over a year old, not in scope.\n- **Directory/audit record** (scout, not \"coverage\" but useful context): Blend is listed Live with $140.9M TVL, but its recorded `lastActivityAt` in the directory is 2025-08-14 — a year stale. Its most recent security audits on file (Certora, Code4rena) are dated 2025-05 through 2025-08, also outside the window.\n\nFor contrast, the wider corpus does discuss Blend in older/adjacent pieces just outside this month — e.g. SDF's blog \"Composability on Stellar\" (2025-12-24) calling Blend \"the execution layer (lending primitive),\" a 2026-04-16 Stellar Developer Meeting note that \"Blend has crossed $80 million in TVL,\" and a 2026-05-25 Lumenloop research note on Peridot Finance's launch describing Blend Capital and Templar Protocol as \"the dominant lenders on the network.\" None of these fall inside the last-30-days window you asked about.\n\nBottom line: if you're tracking Blend's media footprint, the last month was quiet — it's riding along in ecosystem-wide DeFi narratives rather than getting protocol-specific coverage.",
    "requiredPackTerms": [
      "startDate=\"2025-06-18\"",
      "endDate=\"2025-07-07\"",
      "name=\"Stellar Hacks: Blend\"",
      "title=\"Stellar: The Blockchain Wall Street Was Quietly Waiting For\"",
      "date=\"2026-07-16 00:00:00+00\""
    ]
  }
];

export const beansSourceBasisFixture = projectedFixture(savedRowProjections[0]);
export const indexerSourceBasisFixture = projectedFixture(savedRowProjections[1]);

export const largeTranscriptCorrectControls = savedRowProjections.slice(2).map(projectedFixture);
