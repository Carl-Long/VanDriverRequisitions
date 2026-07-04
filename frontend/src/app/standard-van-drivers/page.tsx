"use client";

import { RequisitionListPage } from "@/features/requisitions-shared/components/requisition-list-page";
import { stdRequisitionsApi } from "@/features/std-requisitions/api/std-requisitions-api";
import type { StdRequisitionSummary } from "@/features/std-requisitions/types/std-requisition.types";
import { FASCIAS } from "@/lib/constants/fascias";

export default function StandardDriversPage() {
    return (
        <RequisitionListPage<StdRequisitionSummary>
            title="Standard Van Drivers"
            description="View and manage standard van driver requisitions."
            fascia={FASCIAS.STD}
            detailBasePath="/standard-van-drivers"
            newRequisitionPath="/standard-van-drivers/new"
            emptyTitle="No requisitions found"
            emptyDescription="Try adjusting your filters."
            loadRequisitions={stdRequisitionsApi.getAll}
            loadErrorMessage="Failed to load requisitions."
        />
    );
}