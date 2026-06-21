import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { formatCurrencyGB } from "@/lib/format/currency";

import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdAdditionalCostDraft } from "../types/std-additional-cost-draft";

type StdAdditionalCostLimitStatus =
    | { state: "ok"; messages: string[] }
    | { state: "missing-limit"; messages: string[] }
    | { state: "exceeds-limit"; messages: string[] };

export function getStdAdditionalCostLimitStatus(
    row: StdAdditionalCostDraft,
    mileageLimitRule?: RequisitionLimitRuleSummary,
    flatChargeLimitRule?: RequisitionLimitRuleSummary,
): StdAdditionalCostLimitStatus {
    if (row.chargeType === STD_CHARGE_TYPE.Mileage) {
        if (!mileageLimitRule) {
            return {
                state: "missing-limit",
                messages: ["No STD mileage limit rule is configured."],
            };
        }

        const messages: string[] = [];

        if ((row.miles ?? 0) > mileageLimitRule.maxQuantity) {
            messages.push(
                `Miles exceed maximum of ${mileageLimitRule.maxQuantity}.`,
            );
        }

        if ((row.ratePerMile ?? 0) > mileageLimitRule.maxRate) {
            messages.push(
                `Rate per mile exceeds maximum of ${formatCurrencyGB(
                    mileageLimitRule.maxRate,
                )}.`,
            );
        }

        if (messages.length > 0) {
            return {
                state: "exceeds-limit",
                messages,
            };
        }
    }

    if (row.chargeType === STD_CHARGE_TYPE.FlatCharge) {
        if (!flatChargeLimitRule) {
            return {
                state: "missing-limit",
                messages: ["No STD flat charge limit rule is configured."],
            };
        }

        if ((row.flatCharge ?? 0) > flatChargeLimitRule.maxRate) {
            return {
                state: "exceeds-limit",
                messages: [
                    `Flat charge exceeds maximum of ${formatCurrencyGB(
                        flatChargeLimitRule.maxRate,
                    )}.`,
                ],
            };
        }
    }

    return { state: "ok", messages: [] };
}