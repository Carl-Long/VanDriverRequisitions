import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";

import { REQUISITION_ROW_CATEGORIES } from "../../constants/requisition-row-categories";
import { getFeAdditionalCostLimitStatus } from "./get-fe-additional-cost-limit-status";
import { getFeTransferLimitStatus } from "./get-fe-transfer-limit-status";
import { getGeneralTaskLimitStatus } from "./get-fe-general-task-limit-status";
import { getMileageLimitStatus } from "./get-fe-mileage-limit-status";
import { resolveFeRequisitionLimitRule } from "./resolve-fe-requisition-limit-rule";
import type { FeRequisitionDraft } from "../types/fe-requisition-draft";

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

export function getFeRequisitionTabWarnings({
    draft,
    isReadonly,
    limitRules,
}: Readonly<Params>): FeRequisitionTabWarnings {
    if (isReadonly) {
        return emptyWarnings;
    }

    const mileageLimitRule = resolveFeRequisitionLimitRule({
        rules: limitRules,
        category: REQUISITION_ROW_CATEGORIES.MILEAGE,
    });

    const transferLimitRule = resolveFeRequisitionLimitRule({
        rules: limitRules,
        category: REQUISITION_ROW_CATEGORIES.TRANSFER,
    });

    const additionalCostLimitRule = resolveFeRequisitionLimitRule({
        rules: limitRules,
        category: REQUISITION_ROW_CATEGORIES.ADDITIONAL_COST,
    });

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

        mileageHasWarning: draft.feMileages.some(
            (row) => getMileageLimitStatus(row, mileageLimitRule).state !== "ok",
        ),

        transfersHasWarning: draft.feTransfers.some(
            (row) =>
                row.isShopFromActive === false ||
                row.isShopToActive === false ||
                getFeTransferLimitStatus(row, transferLimitRule).state !== "ok",
        ),

        additionalCostsHasWarning: draft.feAdditionalCosts.some(
            (row) =>
                row.isReasonActive === false ||
                getFeAdditionalCostLimitStatus(
                    row,
                    additionalCostLimitRule,
                    mileageLimitRule,
                ).state !== "ok",
        ),
    };
}