"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { FeRequisitionShell } from "@/components/fe-requisitions/fe-requisition-form/components/fe-requisition-shell";

export default function NewRequisitionPage() {
    return (
        <PageContainer>
            <PageHeader
                title="New Requisition"
                description="Create a new FE requisition."
            />
            <FeRequisitionShell mode="create"/>
        </PageContainer>
    );
}
