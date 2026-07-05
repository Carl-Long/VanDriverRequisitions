import { useMemo } from "react";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";

import {
    getStdRequisitionTabIssues,
    type StdRequisitionTabIssues,
} from "../lib/get-std-requisition-tab-issues";
import type { StdRequisitionDraft } from "../types/std-requisition-draft";

type Params = {
    draft: StdRequisitionDraft;
    isReadonly: boolean;
    stdMileageLimitRule?: RequisitionLimitRuleSummary;
    stdFlatChargeLimitRule?: RequisitionLimitRuleSummary;
    stdVanPackLimitRule?: RequisitionLimitRuleSummary;
};

export type { StdRequisitionTabIssues };

export function useStdRequisitionTabIssues({
    draft,
    isReadonly,
    stdMileageLimitRule,
    stdFlatChargeLimitRule,
    stdVanPackLimitRule,
}: Readonly<Params>): StdRequisitionTabIssues {
    return useMemo(
        () =>
            getStdRequisitionTabIssues({
                draft,
                isReadonly,
                stdMileageLimitRule,
                stdFlatChargeLimitRule,
                stdVanPackLimitRule,
            }),
        [
            draft,
            isReadonly,
            stdMileageLimitRule,
            stdFlatChargeLimitRule,
            stdVanPackLimitRule,
        ],
    );
}