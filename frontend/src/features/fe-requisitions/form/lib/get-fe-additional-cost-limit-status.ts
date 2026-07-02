import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { formatCurrencyGB } from "@/lib/format/currency";

import type { FeAdditionalCostDraft } from "../types/fe-additional-cost-draft";

export type FeAdditionalCostLimitStatus =
    | {
          state: "ok";
          messages: string[];
      }
    | {
          state: "missing-limit";
          messages: string[];
      }
    | {
          state: "exceeds-limit";
          messages: string[];
      };

export function getFeAdditionalCostLimitStatus(
    row: FeAdditionalCostDraft,
    additionalCostLimitRule?: RequisitionLimitRuleSummary,
    mileageLimitRule?: RequisitionLimitRuleSummary,
): FeAdditionalCostLimitStatus {
    const rule =
        row.chargingOption === "Mileage" ? mileageLimitRule : additionalCostLimitRule;

    if (!rule) {
        return {
            state: "missing-limit",
            messages: [
                row.chargingOption === "Mileage"
                    ? "No mileage limit rule is configured."
                    : "No additional cost limit rule is configured.",
            ],
        };
    }

    const messages: string[] = [];

    if (row.chargingOption === "Mileage") {
        if ((row.miles ?? 0) > rule.maxQuantity) {
            messages.push(`Miles exceed maximum of ${rule.maxQuantity}.`);
        }

        if ((row.ratePerMile ?? 0) > rule.maxRate) {
            messages.push(`Rate exceeds maximum of ${formatCurrencyGB(rule.maxRate)}.`);
        }
    } else {
        if ((row.totalNumber ?? 0) > rule.maxQuantity) {
            messages.push(`Quantity exceeds maximum of ${rule.maxQuantity}.`);
        }

        if ((row.ratePerJob ?? 0) > rule.maxRate) {
            messages.push(`Rate exceeds maximum of ${formatCurrencyGB(rule.maxRate)}.`);
        }
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