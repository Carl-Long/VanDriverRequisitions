import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import type { StdCollectionVanPackDraft } from "../types/std-collection-van-pack-draft";

type StdVanPackLimitStatus =
    | { state: "ok"; messages: string[] }
    | { state: "missing-limit"; messages: string[] }
    | { state: "exceeds-limit"; messages: string[] };

export function getStdCollectionVanPackLimitStatus(
    row: StdCollectionVanPackDraft,
    vanPackLimitRule?: RequisitionLimitRuleSummary,
): StdVanPackLimitStatus {
    if (!vanPackLimitRule) {
        return {
            state: "missing-limit",
            messages: ["No STD van pack pricing rule is configured."],
        };
    }

    if ((row.vanPacksOut ?? 0) > vanPackLimitRule.maxQuantity) {
        return {
            state: "exceeds-limit",
            messages: [
                `Van packs out exceed maximum of ${vanPackLimitRule.maxQuantity}.`,
            ],
        };
    }

    return { state: "ok", messages: [] };
}