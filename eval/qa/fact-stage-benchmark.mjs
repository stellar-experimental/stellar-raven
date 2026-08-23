export const FACT_STAGE_LABELS = [
  "absent-upstream",
  "route-uncalled",
  "called-fact-absent",
  "artifact-only",
  "visible-omitted",
  "contradicted",
  "judge-or-golden",
];

export const FACT_STAGE_BENCHMARK = [
  {
    caseId: "q-live-ll-active-jobs-recency",
    factId: "distinct-active-job-listing-identities",
    requiredIdentity: "each Lumenloop job row id and URL",
    requiredEvidenceClass: "returned listing identity",
    firstMissingStage: "contradicted",
    evidenceRefs: [
      "qa-round-2026-08-19-accepted/supplements/live-15.json#rows[id=q-live-ll-active-jobs-recency]",
      "sha256:e6ea94be441c1e70a3ecd3d70549be31969ae72dc96a7a31db693c30e41603de",
      "eval/qa/corpus/live/live-cases.json#caseId=q-live-ll-active-jobs-recency",
      "solo://proj/49/todo/preserve-identities--1745#comment-5066",
      "solo://proj/49/scratchpad/supplementary-qa-art--831?revision=2#Live-15%20non-correct%20review",
    ],
  },
  {
    caseId: "q-live-builders-artifact-continuation",
    factId: "builder-evidence-class-separation",
    requiredIdentity: "builder githubUsername or profile URL",
    requiredEvidenceClass:
      "separate profile, declared-project, codeEvidence, and onStellar fields",
    firstMissingStage: "visible-omitted",
    evidenceRefs: [
      "qa-round-2026-08-19-accepted/supplements/live-15.json#rows[id=q-live-builders-artifact-continuation]",
      "sha256:e6ea94be441c1e70a3ecd3d70549be31969ae72dc96a7a31db693c30e41603de",
      "eval/qa/corpus/live/live-cases.json#caseId=q-live-builders-artifact-continuation",
      "solo://proj/49/todo/preserve-identities--1745#comment-5066",
      "solo://proj/49/scratchpad/supplementary-qa-art--831?revision=2#Live-15%20non-correct%20review",
    ],
  },
  {
    caseId: "q-ti-java-sdk-wallet-feebump",
    factId: "current-java-fee-bump-factories",
    requiredIdentity:
      "network.lightsail:stellar-sdk:4.0.1 FeeBumpTransaction",
    requiredEvidenceClass: "current Java source factory methods",
    firstMissingStage: "called-fact-absent",
    evidenceRefs: [
      "qa-round-2026-08-19-accepted/full-battery/shard-0/artifacts/2026-08-19T02-00-52-variantA.json#rows[id=q-ti-java-sdk-wallet-feebump]",
      "sha256:6dcd3d9458c544030030fde365114da64b27618aa3e6f1fa1d52e82ed570a104",
      "eval/qa/corpus/battery/tooling-infra/q-ti-java-sdk-wallet-feebump.json#golden.keyFacts",
      "solo://proj/49/todo/replay-shard-0-servi--1740#comment-5016",
      "solo://proj/49/todo/replay-shard-0-servi--1740#comment-5018",
    ],
  },
  {
    caseId: "q-tool-cctp-stellar-integration",
    factId: "cctp-finality-and-handler-conflicts",
    requiredIdentity: "Stellar CCTP V2 domain 27 deployment",
    requiredEvidenceClass:
      "Circle primary documentation and deployed contract interface",
    firstMissingStage: "absent-upstream",
    evidenceRefs: [
      "qa-round-2026-08-19-accepted/full-battery/shard-2/artifacts/2026-08-19T13-48-40-variantA.json#rows[id=q-tool-cctp-stellar-integration]",
      "sha256:b1383e944f264758cb8d362806b3d898b3a0db86ab45a0a90c81f6ca699bcabf",
      "eval/qa/corpus/battery/tooling-infra/q-tool-cctp-stellar-integration.json#golden.keyFacts",
      "solo://proj/49/todo/replay-shard-2-servi--1738#comment-5022",
      "solo://proj/49/todo/replay-shard-2-servi--1738#comment-5031",
    ],
  },
  {
    caseId: "q-hist-quantum-preparedness-plan",
    factId: "stage-1-planned-not-shipped",
    requiredIdentity: "SDF Quantum Preparedness Plan published 2026-06-09",
    requiredEvidenceClass: "dated SDF roadmap wording",
    firstMissingStage: "contradicted",
    evidenceRefs: [
      "qa-round-2026-08-19-accepted/full-battery/shard-2/artifacts/2026-08-19T01-13-00-variantA.json#rows[id=q-hist-quantum-preparedness-plan]",
      "sha256:d70e07ec3284ff92d4a28b041b66aef10ab4ca2d1df1e7f86a4a5eb93a2545bb",
      "eval/qa/corpus/battery/history-org-tokenomics/q-hist-quantum-preparedness-plan.json#golden.keyFacts",
      "solo://proj/49/todo/review-quantum-prepa--1739#comment-5002",
      "solo://proj/49/todo/review-quantum-prepa--1739#comment-5004",
    ],
  },
  {
    caseId: "q-infra-rpc-provider-archive-tier",
    factId: "dated-seven-provider-archive-roster",
    requiredIdentity: "official Stellar RPC provider rows as of 2026-07-11",
    requiredEvidenceClass: "dated official provider table",
    firstMissingStage: "called-fact-absent",
    evidenceRefs: [
      "qa-round-2026-08-19-accepted/full-battery/shard-2/artifacts/2026-08-19T01-19-26-variantA.json#rows[id=q-infra-rpc-provider-archive-tier]",
      "sha256:2cb38ba6358c82e8a72a75da9ca36ff6098d0d4a1b4451322774b198e58986c3",
      "eval/qa/corpus/battery/tooling-infra/q-infra-rpc-provider-archive-tier.json#golden.keyFacts",
      "solo://proj/49/todo/review-rpc-archive-p--1741#comment-5000",
      "solo://proj/49/todo/review-rpc-archive-p--1741#comment-5014",
    ],
  },
  {
    caseId: "q-defi-blend-alternatives",
    factId: "lending-project-lifecycle-conflicts",
    requiredIdentity: "OrbitCDP lifecycle conflict",
    requiredEvidenceClass: "Scout records and operator-owned lifecycle pages",
    firstMissingStage: "absent-upstream",
    evidenceRefs: [
      "qa-round-2026-08-19-accepted/full-battery/shard-2/artifacts/2026-08-19T00-39-29-variantA.json#rows[id=q-defi-blend-alternatives]",
      "sha256:fe90f6393f5c599c1f534c404753df928aff24508fedac368f87fb98e4ca6c59",
      "eval/qa/corpus/battery/defi-ecosystem/q-defi-blend-alternatives.json#golden.keyFacts",
      "solo://proj/49/todo/replay-shard-2-servi--1738#comment-5022",
      "solo://proj/49/todo/replay-shard-2-servi--1738#comment-5031",
    ],
  },
  {
    caseId: "q-scf-build-award-cap",
    factId: "build-cap-and-payment-structure",
    requiredIdentity: "SCF Build Award",
    requiredEvidenceClass:
      "ownership collision; saved artifact verdict remains correct",
    firstMissingStage: "judge-or-golden",
    evidenceRefs: [
      "qa-round-2026-08-19-accepted/full-battery/shard-2/artifacts/2026-08-19T02-06-23-variantA.json#rows[id=q-scf-build-award-cap]",
      "sha256:3eb406ebeb182f2e1a696d28c41ccf97757577958635aa734ae840e2b8a5ff2d",
      "eval/qa/corpus/battery/scf-grants-builders/q-scf-build-award-cap.json#golden.keyFacts",
      "solo://proj/49/todo/review-scf-build-pay--1746#comment-5007",
      "solo://proj/49/todo/review-scf-build-pay--1746#comment-5010",
      "solo://proj/49/scratchpad/golden-qa-miss-root--833?revision=13#L6%20independent%20challenge%20%E2%80%94%20reconciled",
    ],
  },
];
