import { FASCIAS } from "@/lib/constants/fascias";

import type {
    RequisitionLimitRuleSummary,
} from "@/features/requisition-limit-rules/requisition-limit-rules-api";

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