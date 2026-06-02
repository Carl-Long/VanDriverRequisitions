"use client";

import { PageContainer } from "@/components/layout/page-container";
import { FeRequisitionShell } from "@/components/fe-requisitions/fe-requisition-form/components/fe-requisition-shell";
import { useRequisitionLimitRules } from "@/components/fe-requisitions/fe-requisition-form/hooks/use-requisition-limit-rules";
import { FeRequisitionShellSkeleton } from "@/components/fe-requisitions/fe-requisition-form/components/fe-requisition-shell-skeleton";
import { useFeTaskTypes } from "@/components/fe-requisitions/fe-requisition-form/hooks/use-fe-task-types";
import { useSubmitWindowStatus } from "@/hooks/use-submit-window-status";

export default function NewRequisitionPage() {
    const {
        limitRules,
        loading: limitRulesLoading,
    } = useRequisitionLimitRules();

    const {
        taskTypes,
        loading: taskTypesLoading,
    } = useFeTaskTypes();

    const {
        status: submitStatus,
        loading: submitWindowStatusLoading,
    } = useSubmitWindowStatus();

    const loading =
        limitRulesLoading ||
        taskTypesLoading ||
        submitWindowStatusLoading;

    if (loading) {
        return (
            <PageContainer>
                <FeRequisitionShellSkeleton />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <FeRequisitionShell
                mode="create"
                taskTypes={taskTypes}
                limitRules={limitRules}
                submitWindowStatus={submitStatus}
                submitWindowStatusLoading={submitWindowStatusLoading}
            />
        </PageContainer>
    );
}