import { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { formatCurrencyGB } from "@/lib/format/currency";
import { FeMileageDraft } from "../types/fe-mileage-draft";

type MileageLimitStatus =
    | { state: "ok"; messages: string[] }
    | { state: "missing-limit"; messages: string[] }
    | { state: "exceeds-limit"; messages: string[] };

export function getMileageLimitStatus(
    row: FeMileageDraft,
    limitRule?: RequisitionLimitRuleSummary,
): MileageLimitStatus {
    if (!limitRule) {
        return {
            state: "missing-limit",
            messages: ["No mileage limit rule is configured."],
        };
    }

    const messages: string[] = [];

    const dailyValues = [
        ["Sunday", row.quantities.sunday],
        ["Monday", row.quantities.monday],
        ["Tuesday", row.quantities.tuesday],
        ["Wednesday", row.quantities.wednesday],
        ["Thursday", row.quantities.thursday],
        ["Friday", row.quantities.friday],
        ["Saturday", row.quantities.saturday],
    ] as const;

    for (const [day, value] of dailyValues) {
        if ((value ?? 0) > limitRule.maxQuantity) {
            messages.push(`${day} exceeds max mileage of ${limitRule.maxQuantity}.`);
        }
    }

    if ((row.ratePerMile ?? 0) > limitRule.maxRate) {
        messages.push(`Rate exceeds maximum of ${formatCurrencyGB(limitRule.maxRate)}.`);
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
