export function isValidAvoidMatches(golden, value) {
  return (
    Array.isArray(value) &&
    new Set(value).size === value.length &&
    value.every(
      (index) =>
        Number.isInteger(index) &&
        index >= 1 &&
        index <= (Array.isArray(golden?.avoid) ? golden.avoid.length : 0)
    )
  );
}

export function checkVerdictConsistency({ golden, verdict }) {
  const violations = [];
  const validCoreAnswer = verdict.coreAnswer === "correct" || verdict.coreAnswer === "incorrect";
  const validMissingFacts =
    Array.isArray(verdict.missingFacts) && verdict.missingFacts.every((fact) => typeof fact === "string");
  const validWrongClaims =
    Array.isArray(verdict.wrongClaims) && verdict.wrongClaims.every((claim) => typeof claim === "string");
  const validAvoidMatches = isValidAvoidMatches(golden, verdict.avoidMatches);

  if (!validCoreAnswer) {
    violations.push("invalid-core-answer");
  }
  if (!validMissingFacts) {
    violations.push("invalid-missing-facts");
  }
  if (!validWrongClaims) {
    violations.push("invalid-wrong-claims");
  }
  if (!validAvoidMatches) {
    violations.push("invalid-avoid-match");
  }

  if (validCoreAnswer && verdict.coreAnswer === "incorrect" && verdict.score !== "wrong") {
    violations.push("core-incorrect-not-wrong");
  }

  if (
    validCoreAnswer &&
    validWrongClaims &&
    verdict.coreAnswer === "correct" &&
    verdict.wrongClaims.length === 0 &&
    validAvoidMatches &&
    verdict.avoidMatches.length === 0 &&
    verdict.score === "wrong"
  ) {
    violations.push("omission-only-wrong");
  }

  if (
    validCoreAnswer &&
    validWrongClaims &&
    verdict.coreAnswer === "correct" &&
    verdict.wrongClaims.length > 0 &&
    verdict.score === "correct"
  ) {
    violations.push("correct-with-wrong-claims");
  }

  if (validAvoidMatches && verdict.avoidMatches.length > 0 && verdict.score !== "wrong") {
    violations.push("fired-avoid-not-wrong");
  }

  if (
    validCoreAnswer &&
    validMissingFacts &&
    validWrongClaims &&
    validAvoidMatches &&
    verdict.coreAnswer === "correct" &&
    verdict.missingFacts.length === 0 &&
    verdict.wrongClaims.length === 0 &&
    verdict.avoidMatches.length === 0 &&
    verdict.score === "partial"
  ) {
    violations.push("partial-without-issue");
  }

  return { ok: violations.length === 0, violations };
}
