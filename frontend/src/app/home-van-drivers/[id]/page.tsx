"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { feRequisitionsApi, FeRequisitionDetail, } from "@/lib/api/fe-requisitions";
import { FeRequisitionShell } from "@/components/fe-requisitions/fe-requisition-form/components/fe-requisition-shell";
import { useToast } from "@/providers/toast-provider";
import { useRequisitionLimitRules } from "@/components/fe-requisitions/fe-requisition-form/hooks/use-requisition-limit-rules";
import { useSubmitWindowStatus } from "@/hooks/use-submit-window-status";
import { useFeTaskTypes } from "@/components/fe-requisitions/fe-requisition-form/hooks/use-fe-task-types";
import { FeRequisitionShellSkeleton } from "@/components/fe-requisitions/fe-requisition-form/components/fe-requisition-shell-skeleton";

export default function Page() {

    const params = useParams<{ id: string }>();
    const router = useRouter();
    const toast = useToast();
    const { limitRules, loading: limitRulesLoading } = useRequisitionLimitRules();
    const {
        taskTypes,
        loading: taskTypesLoading,
    } = useFeTaskTypes();

    const { status: submitWindowStatus, loading: submitWindowStatusLoading } = useSubmitWindowStatus();
    const [requisition, setRequisition] = useState<FeRequisitionDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const pageLoading =
        loading ||
        limitRulesLoading ||
        submitWindowStatusLoading ||
        taskTypesLoading;

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const result =
                    await feRequisitionsApi.getById(
                        params.id,
                    );

                if (!cancelled) {
                    setRequisition(result);
                }
            } catch {
                if (!cancelled) {
                    toast.error(
                        "Failed to load requisition",
                    );

                    router.push(
                        "/home-van-drivers",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [
        params.id,
        router,
        toast,
    ]);

    return (
        <PageContainer>
            {pageLoading || !requisition ? (
                <div>
                    <FeRequisitionShellSkeleton />
                </div>
            ) : (
                <FeRequisitionShell
                    mode={
                        requisition.isEditable
                            ? "edit"
                            : "readonly"
                    }
                    feRequisition={requisition}
                    limitRules={limitRules}
                    taskTypes={taskTypes}
                    submitWindowStatus={submitWindowStatus}
                    submitWindowStatusLoading={submitWindowStatusLoading}
                />
            )}
        </PageContainer>
    );
}