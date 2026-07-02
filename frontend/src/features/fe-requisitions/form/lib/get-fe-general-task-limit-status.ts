import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import type { FeGeneralTaskDraft } from "../types/fe-general-task-draft";
import { formatCurrencyGB } from "@/lib/format/currency";

export type LimitStatus =
    | { state: "ok" }
    | { state: "missing-limit"; messages: string[] }
    | { state: "exceeds-limit"; messages: string[] };

export function getGeneralTaskLimitStatus(
    task: FeGeneralTaskDraft,
    limitRule?: RequisitionLimitRuleSummary,
): LimitStatus {
    if (!limitRule) {
        return {
            state: "missing-limit",
            messages: ["No limit rule is configured for this item."],
        };
    }

    const messages: string[] = [];

    const dayValues = [
        ["Sunday", task.quantities.sunday],
        ["Monday", task.quantities.monday],
        ["Tuesday", task.quantities.tuesday],
        ["Wednesday", task.quantities.wednesday],
        ["Thursday", task.quantities.thursday],
        ["Friday", task.quantities.friday],
        ["Saturday", task.quantities.saturday],
    ] as const;

    for (const [day, value] of dayValues) {
        if ((value ?? 0) > limitRule.maxQuantity) {
            messages.push(`${day} exceeds max quantity of ${limitRule.maxQuantity}.`);
        }
    }

    if (task.ratePerJob !== null && task.ratePerJob > limitRule.maxRate) {
        messages.push(`Rate exceeds maximum of ${formatCurrencyGB(limitRule.maxRate)}.`);
    }

    if (messages.length > 0) {
        return {
            state: "exceeds-limit",
            messages,
        };
    }

    return { state: "ok" };
}
