import { useMemo } from "react";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";

import { REQUISITION_ROW_CATEGORIES } from "../../constants/requisition-row-categories";
import { getGeneralTaskLimitStatus } from "../lib/get-fe-general-task-limit-status";
import { getMileageLimitStatus } from "../lib/get-fe-mileage-limit-status";
import { resolveFeRequisitionLimitRule } from "../lib/resolve-fe-requisition-limit-rule";
import type { FeRequisitionDraft } from "../types/fe-requisition-draft";
import { getFeAdditionalCostLimitStatus } from "../lib/get-fe-additional-cost-limit-status";
import { getFeTransferLimitStatus } from "../lib/get-fe-transfer-limit-status";


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