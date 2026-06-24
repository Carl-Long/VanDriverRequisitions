"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import NotFound from "@/app/not-found";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { getApiErrorMessage } from "@/lib/api/client";
import { canCreateRequisitions } from "@/features/auth/roles";
import { StdRequisitionShell } from "@/features/std-requisitions/form/components/std-requisition-shell";
import { StdRequisitionShellSkeleton } from "@/features/std-requisitions/form/components/std-requisition-shell-skeleton";
import type { StdRequisitionDetail } from "@/features/std-requisitions/types/std-requisition.types";
import { stdRequisitionsApi } from "@/features/std-requisitions/api/std-requisitions-api";
import { useAuth } from "@/providers/auth-provider";
import { useSubmitWindowStatus } from "@/features/submit-windows/hooks/use-submit-window-status";
import { useRequisitionLimitRules } from "@/features/requisition-limit-rules/use-requisition-limit-rules";
import { getSafeReturnTo } from "@/features/requisitions-shared/lib/get-safe-return-to";

export default function StdRequisitionDetailPage() {
    const { user, loading: authLoading } = useAuth();
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const { limitRules, loading: limitRulesLoading, error: limitRulesError } = useRequisitionLimitRules();

    const [requisition, setRequisition] = useState<StdRequisitionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const backHref = getSafeReturnTo(searchParams.get("returnTo"), ["/standard-van-drivers"], "/standard-van-drivers");

    const tabParam = searchParams.get("tab");
    const initialActiveTabKey = tabParam === "submission-history" ? "submission-history" : undefined;
    const { status: submitWindowStatus, loading: submitWindowStatusLoading, error: submitWindowStatusError, } = useSubmitWindowStatus();
    const errors = [error, limitRulesError, submitWindowStatusError].filter((e): e is string => Boolean(e));
    const pageLoading = authLoading || loading || limitRulesLoading || submitWindowStatusLoading;

    useEffect(() => {
        if (!params.id) {
            return;
        }

        let cancelled = false;

        async function run() {
            setLoading(true);
            setError(null);

            try {
                const result = await stdRequisitionsApi.getById(params.id);

                if (!cancelled) {
                    setRequisition(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(getApiErrorMessage(err, "Failed to load STD requisition."));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        run();

        return () => {
            cancelled = true;
        };
    }, [params.id]);

    if (pageLoading) {
        return (
            <PageContainer>
                <StdRequisitionShellSkeleton />
            </PageContainer>
        );
    }

    if (!canCreateRequisitions(user)) {
        return <NotFound />;
    }

    if (errors.length > 0) {
        return (
            <PageContainer>
                <div className="space-y-4">
                    {errors.map((error, index) => (
                        <Alert key={`${index}-${error}`}>{error}</Alert>
                    ))}
                </div>
            </PageContainer>
        );
    }

    if (!requisition) {
        return <NotFound />;
    }

    return (
        <PageContainer>
            <StdRequisitionShell
                mode={requisition.isEditable ? "edit" : "readonly"}
                limitRules={limitRules}
                stdRequisition={requisition}
                backHref={backHref}
                submitWindowStatus={submitWindowStatus}
                submitWindowStatusLoading={submitWindowStatusLoading}
                initialActiveTabKey={initialActiveTabKey}
            />
        </PageContainer>
    );
}