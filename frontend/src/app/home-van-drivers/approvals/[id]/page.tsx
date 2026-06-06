"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";

import {
    feRequisitionsApi,
    type FeRequisitionDetail,
} from "@/lib/api/fe-requisitions";

import {
    ApiError,
    getApiErrorMessage,
} from "@/lib/api/client";

import { useAuth } from "@/providers/auth-provider";
import { isApprover } from "@/lib/auth/roles";

import { FeRequisitionShell } from "@/components/fe-requisitions/fe-requisition-form/components/fe-requisition-shell";
import { FeRequisitionShellSkeleton } from "@/components/fe-requisitions/fe-requisition-form/components/fe-requisition-shell-skeleton";
import { useRequisitionLimitRules } from "@/components/fe-requisitions/fe-requisition-form/hooks/use-requisition-limit-rules";
import { useFeTaskTypes } from "@/components/fe-requisitions/fe-requisition-form/hooks/use-fe-task-types";
import NotFound from "@/app/not-found";

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

    const [requisition, setRequisition] =
        useState<FeRequisitionDetail | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setError(null);

                const result = await feRequisitionsApi.getById(
                    params.id,
                );

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
                    }

                    setError(
                        getApiErrorMessage(
                            err,
                            "Failed to load requisition.",
                        ),
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
    }, [params.id]);

    const pageLoading =
        loading ||
        limitRulesLoading ||
        taskTypesLoading;

    const errors = [
        error,
        limitRulesError,
        taskTypesError,
    ].filter((e): e is string => Boolean(e));

    if (pageLoading) {
        return (
            <PageContainer>
                <FeRequisitionShellSkeleton />
            </PageContainer>
        );
    }

    if (notFound) {
        return <NotFound />;
    }

    if (!isApprover(user)) {
        return <NotFound />;
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

    if (!requisition) {
        return null;
    }

    return (
        <PageContainer>
            <FeRequisitionShell
                mode="approval"
                feRequisition={requisition}
                limitRules={limitRules}
                taskTypes={taskTypes}
                submitWindowStatus={null}
                submitWindowStatusLoading={false}
            />
        </PageContainer>
    );
}