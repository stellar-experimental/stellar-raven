// Ambient declaration for build-catalog.mjs (plain JS, no build step) so
// test/catalog.test.ts can import its exported guards directly under
// `tsc --noEmit`. Declares only the subset of exports the tests import,
// not the module's full exported surface.
export function assertNoNonExposedRefs(entries: readonly unknown[]): void;
export function assertBuildAuthorityIdsResolve(entries: readonly unknown[]): void;
export function assertSideEffectingOpsExcluded(
  openapi: unknown,
  excluded?: ReadonlySet<string>
): void;
export function attachKnownAliases(
  entries: readonly Record<string, unknown>[],
  packs?: readonly Record<string, unknown>[]
): Array<Record<string, unknown>>;
export function attachRetrievalProfiles(
  entries: readonly Record<string, unknown>[],
  profiles?: Record<string, unknown>
): Array<Record<string, unknown>>;
export function attachDiscoveryModes(
  entries: readonly Record<string, unknown>[],
  recoveryOnlyIds?: ReadonlySet<string>
): Array<Record<string, unknown>>;
