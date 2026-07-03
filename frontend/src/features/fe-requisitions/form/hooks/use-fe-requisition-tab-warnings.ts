import { useMemo } from "react";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { getFeRequisitionTabWarnings, type FeRequisitionTabWarnings } from "../lib/get-fe-requisition-tab-warnings";
import type { FeRequisitionDraft } from "../types/fe-requisition-draft";

type Params = {
    draft: FeRequisitionDraft;
    isReadonly: boolean;
    limitRules: RequisitionLimitRuleSummary[];
};

export type { FeRequisitionTabWarnings };

export function useFeRequisitionTabWarnings({
    draft,
    isReadonly,
    limitRules,
}: Readonly<Params>): FeRequisitionTabWarnings {
    return useMemo(
        () =>
            getFeRequisitionTabWarnings({
                draft,
                isReadonly,
                limitRules,
            }),
        [
            draft,
            isReadonly,
            limitRules,
        ],
    );
}