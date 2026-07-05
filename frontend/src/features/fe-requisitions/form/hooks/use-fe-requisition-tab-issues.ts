import { useMemo } from "react";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import {
    getFeRequisitionTabIssues,
    type FeRequisitionTabIssues,
} from "../lib/get-fe-requisition-tab-issues";
import type { FeRequisitionDraft } from "../types/fe-requisition-draft";

type Params = {
    draft: FeRequisitionDraft;
    isReadonly: boolean;
    limitRules: RequisitionLimitRuleSummary[];
};

export type { FeRequisitionTabIssues };

export function useFeRequisitionTabIssues({
    draft,
    isReadonly,
    limitRules,
}: Readonly<Params>): FeRequisitionTabIssues {
    return useMemo(
        () =>
            getFeRequisitionTabIssues({
                draft,
                isReadonly,
                limitRules,
            }),
        [draft, isReadonly, limitRules],
    );
}