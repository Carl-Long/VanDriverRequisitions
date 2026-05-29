import { FASCIAS } from "@/lib/constants/fascias";

import { REQUISITION_ROW_CATEGORIES } from "@/lib/constants/requisition-row-categories";

import type {
    RequisitionLimitRuleSummary,
} from "@/lib/api/requisition-limit-rules";

type Params = {
    rules: RequisitionLimitRuleSummary[];
    categoryId: number;
    taskTypeId?: string | null;
};

export function resolveFeRequisitionLimitRule({
    rules,
    categoryId,
    taskTypeId,
}: Params) {
    const exact =
        rules.find(
            (x) =>
                x.fasciaId ===
                    FASCIAS.FE &&
                x.categoryId ===
                    categoryId &&
                x.feTaskTypeId ===
                    taskTypeId,
        );

    if (exact) {
        return exact;
    }

    return rules.find(
        (x) =>
            x.fasciaId ===
                FASCIAS.FE &&
            x.categoryId ===
                categoryId &&
            x.feTaskTypeId ==
                null,
    );
}