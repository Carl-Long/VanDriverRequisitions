"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { RequisitionForm } from "@/components/fe-requisitions/requisition-form";

export default function NewRequisitionPage() {
    return (
        <PageContainer>
            <PageHeader
                title="New Requisition"
                description="Create a new FE requisition."
            />
            <RequisitionForm initial={null} />
        </PageContainer>
    );
}
