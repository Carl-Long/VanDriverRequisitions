"use client";

import { PageContainer } from "@/components/layout/page-container";
import { FeRequisitionShell } from "@/components/fe-requisitions/fe-requisition-form/components/fe-requisition-shell";
import { useRequisitionLimitRules } from "@/components/fe-requisitions/fe-requisition-form/hooks/use-requisition-limit-rules";

export default function NewRequisitionPage() {

    const { limitRules } = useRequisitionLimitRules();

    return (
        <PageContainer>
            <FeRequisitionShell
                mode="create"
                limitRules={limitRules}
            />
        </PageContainer>
    );
}
