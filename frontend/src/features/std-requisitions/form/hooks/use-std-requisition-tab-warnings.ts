import { useMemo } from "react";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";

import {
    getStdRequisitionTabWarnings,
    type StdRequisitionTabWarnings,
} from "../lib/get-std-requisition-tab-warnings";
import type { StdRequisitionDraft } from "../types/std-requisition-draft";

type Params = {
    draft: StdRequisitionDraft;
    isReadonly: boolean;
    stdMileageLimitRule?: RequisitionLimitRuleSummary;
    stdFlatChargeLimitRule?: RequisitionLimitRuleSummary;
    stdVanPackLimitRule?: RequisitionLimitRuleSummary;
};

export type { StdRequisitionTabWarnings };

export function useStdRequisitionTabWarnings({
    draft,
    isReadonly,
    stdMileageLimitRule,
    stdFlatChargeLimitRule,
    stdVanPackLimitRule,
}: Readonly<Params>): StdRequisitionTabWarnings {
    return useMemo(
        () =>
            getStdRequisitionTabWarnings({
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