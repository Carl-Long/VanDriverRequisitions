import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { areCurrencyAmountsEqual, formatCurrencyGB } from "@/lib/format/currency";
import type { StdCollectionVanPackDraft } from "../types/std-collection-van-pack-draft";

export function getStdCollectionVanPackRateChangeMessage(
    rows: StdCollectionVanPackDraft[],
    vanPackLimitRule?: RequisitionLimitRuleSummary,
) {
    if (!vanPackLimitRule || rows.length === 0) {
        return null;
    }

    const hasChangedRate = rows.some(
        (row) =>
            !areCurrencyAmountsEqual(
                row.ratePerVanPack,
                vanPackLimitRule.maxRate,
            ),
    );

    if (!hasChangedRate) {
        return null;
    }

    return `The Van Pack fixed price has changed. Saving or submitting this requisition will update Van Pack rows and totals to the current fixed price of ${formatCurrencyGB(vanPackLimitRule.maxRate)}. You can also update each row if you wish.`;
}