import { FASCIAS } from "@/lib/constants/fascias";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";

type Params = {
    rules: RequisitionLimitRuleSummary[];
    category: RequisitionLimitRuleSummary["category"];
    taskTypeId?: string | null;
};
export function resolveFeRequisitionLimitRule({ rules, category, taskTypeId }: Params) {
    const exact = rules.find(
        (x) =>
            x.fascia === FASCIAS.FE &&
            x.category === category &&
            x.feTaskTypeId === taskTypeId,
    );

    if (exact) {
        return exact;
    }

    return rules.find(
        (x) => x.fascia === FASCIAS.FE && x.category === category && x.feTaskTypeId == null,
    );
}
