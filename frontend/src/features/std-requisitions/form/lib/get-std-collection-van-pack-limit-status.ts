import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { areCurrencyAmountsEqual, formatCurrencyGB } from "@/lib/format/currency";
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

    const messages: string[] = [];

    if ((row.vanPacksOut ?? 0) > vanPackLimitRule.maxQuantity) {
        messages.push(
            `Van packs out exceed maximum of ${vanPackLimitRule.maxQuantity}.`,
        );
    }

    if (!areCurrencyAmountsEqual(row.ratePerVanPack, vanPackLimitRule.maxRate)) {
        messages.push(
            `Saved price ${formatCurrencyGB(row.ratePerVanPack)} differs from current configured price ${formatCurrencyGB(vanPackLimitRule.maxRate)}.`,
        );
    }

    if (messages.length === 0) {
        return { state: "ok", messages: [] };
    }

    return { state: "exceeds-limit", messages };
}