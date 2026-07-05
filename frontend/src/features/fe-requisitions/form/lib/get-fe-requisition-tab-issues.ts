import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import {
    combineRequisitionTabIssueSeverities,
    getHistoricalLookupTabIssueSeverity,
    getLimitStatusTabIssueSeverity,
    REQUISITION_TAB_ISSUE_SEVERITY,
    type RequisitionTabIssueSeverity,
} from "@/features/requisitions-shared/types/requisition-tab-issue-severity";

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

export type FeRequisitionTabIssues = {
    mileage: RequisitionTabIssueSeverity;
    transfers: RequisitionTabIssueSeverity;
    additionalCosts: RequisitionTabIssueSeverity;
    getTaskTypeTabIssueSeverity: (taskTypeId: string) => RequisitionTabIssueSeverity;
};

const emptyIssues: FeRequisitionTabIssues = {
    mileage: REQUISITION_TAB_ISSUE_SEVERITY.None,
    transfers: REQUISITION_TAB_ISSUE_SEVERITY.None,
    additionalCosts: REQUISITION_TAB_ISSUE_SEVERITY.None,
    getTaskTypeTabIssueSeverity: () => REQUISITION_TAB_ISSUE_SEVERITY.None,
};

export function getFeRequisitionTabIssues({
    draft,
    isReadonly,
    limitRules,
}: Readonly<Params>): FeRequisitionTabIssues {
    if (isReadonly) {
        return emptyIssues;
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
        getTaskTypeTabIssueSeverity: (taskTypeId: string) => {
            const tasks = draft.feGeneralTasks.filter(
                (task) => task.taskTypeId === taskTypeId,
            );

            const limitRule = resolveFeRequisitionLimitRule({
                rules: limitRules,
                category: REQUISITION_ROW_CATEGORIES.GENERAL_TASK,
                taskTypeId,
            });

            return combineRequisitionTabIssueSeverities(
                ...tasks.map((task) =>
                    getLimitStatusTabIssueSeverity(
                        getGeneralTaskLimitStatus(task, limitRule),
                    ),
                ),
            );
        },

        mileage: combineRequisitionTabIssueSeverities(
            ...draft.feMileages.map((row) =>
                getLimitStatusTabIssueSeverity(
                    getMileageLimitStatus(row, mileageLimitRule),
                ),
            ),
        ),

        transfers: combineRequisitionTabIssueSeverities(
            ...draft.feTransfers.map((row) =>
                combineRequisitionTabIssueSeverities(
                    getHistoricalLookupTabIssueSeverity(
                        row.isShopFromActive === false || row.isShopToActive === false,
                    ),
                    getLimitStatusTabIssueSeverity(
                        getFeTransferLimitStatus(row, transferLimitRule),
                    ),
                ),
            ),
        ),

        additionalCosts: combineRequisitionTabIssueSeverities(
            ...draft.feAdditionalCosts.map((row) =>
                combineRequisitionTabIssueSeverities(
                    getHistoricalLookupTabIssueSeverity(row.isReasonActive === false),
                    getLimitStatusTabIssueSeverity(
                        getFeAdditionalCostLimitStatus(
                            row,
                            additionalCostLimitRule,
                            mileageLimitRule,
                        ),
                    ),
                ),
            ),
        ),
    };
}