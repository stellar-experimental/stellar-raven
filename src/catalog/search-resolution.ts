/**
 * Catalog-dependent request resolution shared by the public MCP search tool
 * and the in-sandbox `codemode.search` adapter.
 *
 * Callers still own their transport contracts: schemas or raw-input checks,
 * exact prose and envelopes, limit normalization, response shaping, and
 * telemetry. This module owns only catalog-derived validation and facts.
 */
import {
  catalogServices,
  recoveryCandidates,
  searchCatalogPage,
  type RecoveryCandidate,
  type SearchPage
} from "./search.ts";
import type { Catalog, RetrievalReason, SearchKind } from "./types.ts";

type CatalogSearchResolutionRequest = {
  query: string;
  kind?: SearchKind;
  limit?: number;
  reason?: RetrievalReason;
};

type UnknownServiceIssue = {
  code: "unknown-service";
  service: string;
  validServices: readonly string[];
};

type UnknownRecoveryIdsIssue = {
  code: "unknown-recovery-ids";
  ids: string[];
};

type CatalogSearchRecoveryStage =
  | {
      ok: true;
      resolve: (request: CatalogSearchResolutionRequest) => {
        page: SearchPage;
        recovery: RecoveryCandidate[];
      };
    }
  | {
      ok: false;
      issue: UnknownRecoveryIdsIssue;
    };

type PreparedCatalogSearch =
  | {
      ok: true;
      checkRecoveryIds: (recoverFrom?: readonly string[]) => CatalogSearchRecoveryStage;
    }
  | {
      ok: false;
      issue: UnknownServiceIssue;
    };

/**
 * Validate the exact service first. The recovery-ID stage and final resolution
 * stage let raw-input adapters preserve their validation order without
 * repeating either catalog check.
 */
export function prepareCatalogSearch(
  catalog: Catalog,
  service: string | undefined
): PreparedCatalogSearch {
  const validServices = catalogServices(catalog);
  if (service !== undefined && !validServices.includes(service)) {
    return {
      ok: false,
      issue: { code: "unknown-service", service, validServices }
    };
  }

  return {
    ok: true,
    checkRecoveryIds: (requestedRecoverFrom) => {
      // Keep the service stage limited to service validation. The sandbox
      // checks the external recoverFrom shape before it enters this stage.
      const knownOperationIds = new Set(
        catalog.entries.filter((entry) => entry.kind === "operation").map((entry) => entry.id)
      );
      const recoverFrom = requestedRecoverFrom ?? [];
      const unknownRecoveryIds = recoverFrom.filter((id) => !knownOperationIds.has(id));
      if (unknownRecoveryIds.length > 0) {
        return {
          ok: false,
          issue: { code: "unknown-recovery-ids", ids: unknownRecoveryIds }
        };
      }

      return {
        ok: true,
        resolve: (request) => {
          const page = searchCatalogPage(catalog, {
            query: request.query,
            kind: request.kind,
            service,
            limit: request.limit
          });
          const recovery = recoverFrom.length > 0
            ? recoveryCandidates(catalog, recoverFrom, request.reason)
            : [];
          return { page, recovery };
        }
      };
    }
  };
}
