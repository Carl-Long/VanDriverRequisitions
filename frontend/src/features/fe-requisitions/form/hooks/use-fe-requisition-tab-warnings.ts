import { useMemo } from "react";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";

import { REQUISITION_ROW_CATEGORIES } from "../../constants/requisition-row-categories";
import { getGeneralTaskLimitStatus } from "../lib/get-fe-general-task-limit-status";
import { getMileageLimitStatus } from "../lib/get-fe-mileage-limit-status";
import { resolveFeRequisitionLimitRule } from "../lib/resolve-fe-requisiton-limit-rule";
import type { FeRequisitionDraft } from "../types/fe-requisition-draft";
import type { FeAdditionalCostDraft } from "../types/fe-additional-cost-draft";
import type { FeTransferDraft } from "../types/fe-transfer-draft";
import { formatCurrencyGB } from "@/lib/format/currency";

type Params = {
    draft: FeRequisitionDraft;
    isReadonly: boolean;
    limitRules: RequisitionLimitRuleSummary[];
};

export type FeRequisitionTabWarnings = {
    mileageHasWarning: boolean;
    transfersHasWarning: boolean;
    additionalCostsHasWarning: boolean;
    getTaskTypeTabHasWarning: (taskTypeId: string) => boolean;
};

const emptyWarnings: FeRequisitionTabWarnings = {
    mileageHasWarning: false,
    transfersHasWarning: false,
    additionalCostsHasWarning: false,
    getTaskTypeTabHasWarning: () => false,
};

export function useFeRequisitionTabWarnings({
    draft,
    isReadonly,
    limitRules,
}: Readonly<Params>): FeRequisitionTabWarnings {
    return useMemo(() => {
        if (isReadonly) {
            return emptyWarnings;
        }

        return {
            getTaskTypeTabHasWarning: (taskTypeId: string) => {
                const tasks = draft.feGeneralTasks.filter(
                    (task) => task.taskTypeId === taskTypeId,
                );

                const limitRule = resolveFeRequisitionLimitRule({
                    rules: limitRules,
                    category: REQUISITION_ROW_CATEGORIES.GENERAL_TASK,
                    taskTypeId,
                });

                return tasks.some(
                    (task) => getGeneralTaskLimitStatus(task, limitRule).state !== "ok",
                );
            },

            mileageHasWarning: draft.feMileages.some((row) => {
                const limitRule = resolveFeRequisitionLimitRule({
                    rules: limitRules,
                    category: REQUISITION_ROW_CATEGORIES.MILEAGE,
                });

                return getMileageLimitStatus(row, limitRule).state !== "ok";
            }),

            transfersHasWarning: draft.feTransfers.some((row) => {
                const limitRule = resolveFeRequisitionLimitRule({
                    rules: limitRules,
                    category: REQUISITION_ROW_CATEGORIES.TRANSFER,
                });

                return (
                    row.isShopFromActive === false ||
                    row.isShopToActive === false ||
                    getFeTransferLimitStatus(row, limitRule).state !== "ok"
                );
            }),

            additionalCostsHasWarning: draft.feAdditionalCosts.some((row) => {
                const additionalCostLimitRule = resolveFeRequisitionLimitRule({
                    rules: limitRules,
                    category: REQUISITION_ROW_CATEGORIES.ADDITIONAL_COST,
                });

                const mileageLimitRule = resolveFeRequisitionLimitRule({
                    rules: limitRules,
                    category: REQUISITION_ROW_CATEGORIES.MILEAGE,
                });

                return (
                    row.isReasonActive === false ||
                    getFeAdditionalCostLimitStatus(
                        row,
                        additionalCostLimitRule,
                        mileageLimitRule,
                    ).state !== "ok"
                );
            }),
        };
    }, [
        draft.feGeneralTasks,
        draft.feMileages,
        draft.feTransfers,
        draft.feAdditionalCosts,
        isReadonly,
        limitRules,
    ]);
}

type LimitStatus =
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

function getFeTransferLimitStatus(
    row: FeTransferDraft,
    limitRule?: RequisitionLimitRuleSummary,
): LimitStatus {
    if (!limitRule) {
        return {
            state: "missing-limit",
            messages: ["No transfer limit rule is configured."],
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
            messages.push(`${day} exceeds max quantity of ${limitRule.maxQuantity}.`);
        }
    }

    if ((row.ratePerJob ?? 0) > limitRule.maxRate) {
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

function getFeAdditionalCostLimitStatus(
    row: FeAdditionalCostDraft,
    additionalCostLimitRule?: RequisitionLimitRuleSummary,
    mileageLimitRule?: RequisitionLimitRuleSummary,
): LimitStatus {
    const rule = row.chargingOption === "Mileage" ? mileageLimitRule : additionalCostLimitRule;

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