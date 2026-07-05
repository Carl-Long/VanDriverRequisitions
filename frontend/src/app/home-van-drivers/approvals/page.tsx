"use client";

import { feRequisitionsApi } from "@/features/fe-requisitions/api/fe-requisitions-api";
import type { FeRequisitionSummary } from "@/features/fe-requisitions/types/fe-requisition.types";
import { RequisitionApprovalsPage } from "@/features/requisitions-shared/components/requisition-approvals-page";

export default function FeRequisitionApprovalsPage() {
    return (
        <RequisitionApprovalsPage<FeRequisitionSummary>
            title="Home Approvals"
            description="Review submitted home van driver requisitions awaiting approval."
            detailBasePath="/home-van-drivers/approvals"
            emptySearchDescription="No submitted requisitions match that requisition number."
            emptyDefaultDescription="There are no submitted requisitions awaiting approval."
            loadApprovals={feRequisitionsApi.getAll}
        />
    );
}