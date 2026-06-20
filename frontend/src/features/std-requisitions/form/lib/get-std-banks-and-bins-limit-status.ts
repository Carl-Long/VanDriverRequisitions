import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { formatCurrencyGB } from "@/lib/format/currency";
import type { StdCollectionChargeBanksAndBinsDraft } from "../types/std-collection-charge-banks-and-bins-draft";

type StdLimitStatus =
    | { state: "ok"; messages: string[] }
    | { state: "missing-limit"; messages: string[] }
    | { state: "exceeds-limit"; messages: string[] };

export function getStdBanksAndBinsLimitStatus(
    row: StdCollectionChargeBanksAndBinsDraft,
    mileageLimitRule?: RequisitionLimitRuleSummary,
    flatChargeLimitRule?: RequisitionLimitRuleSummary,
): StdLimitStatus {
    const rule = row.chargeType === "Mileage" ? mileageLimitRule : flatChargeLimitRule;

    if (!rule) {
        return {
            state: "missing-limit",
            messages: [
                row.chargeType === "Mileage"
                    ? "No STD mileage limit rule is configured."
                    : "No STD flat charge limit rule is configured.",
            ],
        };
    }

    const messages: string[] = [];

    if (row.chargeType === "Mileage") {
        if ((row.miles ?? 0) > rule.maxQuantity) {
            messages.push(`Miles exceed maximum of ${rule.maxQuantity}.`);
        }

        if ((row.ratePerMile ?? 0) > rule.maxRate) {
            messages.push(`Rate exceeds maximum of ${formatCurrencyGB(rule.maxRate)}.`);
        }
    }

    if (row.chargeType === "FlatCharge" && (row.flatCharge ?? 0) > rule.maxRate) {
        messages.push(`Flat charge exceeds maximum of ${formatCurrencyGB(rule.maxRate)}.`);
    }

    if (messages.length === 0) {
        return {
            state: "ok",
            messages: [],
        };
    }

    return {
        state: "exceeds-limit",
        messages,
    };
}