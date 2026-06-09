"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";

import {
    getApiErrorMessage,
    ApiError,
} from "@/lib/api/client";

import { FeRequisitionShell } from "@/components/fe-requisitions/fe-requisition-form/components/fe-requisition-shell";
import { FeRequisitionShellSkeleton } from "@/components/fe-requisitions/fe-requisition-form/components/fe-requisition-shell-skeleton";

import { useRequisitionLimitRules } from "@/components/fe-requisitions/fe-requisition-form/hooks/use-requisition-limit-rules";
import { useFeTaskTypes } from "@/components/fe-requisitions/fe-requisition-form/hooks/use-fe-task-types";
import { useSubmitWindowStatus } from "@/features/submit-windows/hooks/use-submit-window-status";
import NotFound from "@/app/not-found";
import { useAuth } from "@/providers/auth-provider";
import { canCreateRequisitions } from "@/lib/auth/roles";
import { FeRequisitionDetail, feRequisitionsApi } from "@/features/fe-requisitions/api/fe-requisitions-api";

export default function Page() {
    const params = useParams<{ id: string }>();
    const { user } = useAuth();

    const {
        limitRules,
        loading: limitRulesLoading,
        error: limitRulesError,
    } = useRequisitionLimitRules();

    const {
        taskTypes,
        loading: taskTypesLoading,
        error: taskTypesError,
    } = useFeTaskTypes();

    const {
        status: submitWindowStatus,
        loading: submitWindowStatusLoading,
        error: submitWindowStatusError,
    } = useSubmitWindowStatus();

    const [requisition, setRequisition] = useState<FeRequisitionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setError(null);
                const result = await feRequisitionsApi.getById(params.id);
                if (!cancelled) {
                    setRequisition(result);
                }
            } catch (err) {
                if (!cancelled) {
                    if (
                        err instanceof ApiError &&
                        err.status === 404
                    ) {
                        setNotFound(true);
                        return;
                    } else {
                        setError(
                            getApiErrorMessage(
                                err,
                                "Failed to load requisition.",
                            ),
                        );
                    }
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
    }, [params.id]);

    const pageLoading =
        loading ||
        limitRulesLoading ||
        taskTypesLoading ||
        submitWindowStatusLoading;

    const errors = [
        error,
        limitRulesError,
        taskTypesError,
        submitWindowStatusError,
    ].filter(
        (e): e is string => Boolean(e),
    );


    if (!canCreateRequisitions(user)) {
        return <NotFound />;
    }

    if (notFound) {
        return <NotFound />;
    }

    if (pageLoading) {
        return (
            <PageContainer>
                <FeRequisitionShellSkeleton />
            </PageContainer>
        );
    }

    if (!requisition) {
        return null;
    }

    if (errors.length > 0) {
        return (
            <PageContainer>
                <div className="space-y-4">
                    {errors.map((error, index) => (
                        <Alert key={`${index}-${error}`}>
                            {error}
                        </Alert>
                    ))}
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
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
                submitWindowStatusLoading={
                    submitWindowStatusLoading
                }
            />
        </PageContainer>
    );
}