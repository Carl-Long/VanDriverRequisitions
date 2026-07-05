"use client";

import { feRequisitionsApi } from "@/features/fe-requisitions/api/fe-requisitions-api";
import type { FeRequisitionSummary } from "@/features/fe-requisitions/types/fe-requisition.types";
import { RequisitionListPage } from "@/features/requisitions-shared/components/requisition-list-page";
import { FASCIAS } from "@/lib/constants/fascias";

export default function HomeVanDriversPage() {
    return (
        <RequisitionListPage<FeRequisitionSummary>
            title="Home Van Drivers"
            description="View and manage home van driver requisitions."
            fascia={FASCIAS.FE}
            detailBasePath="/home-van-drivers"
            newRequisitionPath="/home-van-drivers/new"
            emptyTitle="No requisitions found"
            emptyDescription="Try adjusting your filters."
            loadRequisitions={feRequisitionsApi.getAll}
            loadErrorMessage="Failed to load requisitions."
        />
    );
}