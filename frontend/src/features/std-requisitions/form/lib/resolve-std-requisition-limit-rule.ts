import { FASCIAS } from "@/lib/constants/fascias";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";

type Params = {
    rules: RequisitionLimitRuleSummary[];
    categoryId: number;
};

export function resolveStdRequisitionLimitRule({ rules, categoryId }: Params) {
    return rules.find((x) => x.fasciaId === FASCIAS.STD && x.categoryId === categoryId);
}