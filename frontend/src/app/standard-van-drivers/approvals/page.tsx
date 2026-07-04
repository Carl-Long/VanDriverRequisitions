"use client";

import { RequisitionApprovalsPage } from "@/features/requisitions-shared/components/requisition-approvals-page";
import { stdRequisitionsApi } from "@/features/std-requisitions/api/std-requisitions-api";
import type { StdRequisitionSummary } from "@/features/std-requisitions/types/std-requisition.types";

export default function StdRequisitionApprovalsPage() {
    return (
        <RequisitionApprovalsPage<StdRequisitionSummary>
            title="Standard Approvals"
            description="Review submitted standard van driver requisitions awaiting approval."
            detailBasePath="/standard-van-drivers/approvals"
            emptySearchDescription="No submitted STD requisitions match that requisition number."
            emptyDefaultDescription="There are no submitted requisitions awaiting approval."
            loadApprovals={stdRequisitionsApi.getAll}
        />
    );
}