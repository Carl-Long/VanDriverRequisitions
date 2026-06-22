import { FASCIAS } from "@/lib/constants/fascias";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";

type Params = {
    rules: RequisitionLimitRuleSummary[];
    category: RequisitionLimitRuleSummary["category"];
};

export function resolveStdRequisitionLimitRule({ rules, category }: Params) {
    return rules.find((x) => x.fascia === FASCIAS.STD && x.category === category);
}