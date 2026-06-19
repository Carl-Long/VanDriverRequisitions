"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import NotFound from "@/app/not-found";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { canApproveRequisitions } from "@/features/auth/roles";
import { stdRequisitionsApi } from "@/features/std-requisitions/api/std-requisitions-api";
import { StdRequisitionShell } from "@/features/std-requisitions/form/components/std-requisition-shell";
import { StdRequisitionShellSkeleton } from "@/features/std-requisitions/form/components/std-requisition-shell-skeleton";
import type { StdRequisitionDetail } from "@/features/std-requisitions/types/std-requisition.types";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";

export default function StdRequisitionApprovalDetailPage() {
    const params = useParams<{ id: string }>();
    const { user, loading: authLoading } = useAuth();

    const [requisition, setRequisition] = useState<StdRequisitionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);

    const canApprove = canApproveRequisitions(user);

    useEffect(() => {
        if (authLoading || !canApprove) return;

        let cancelled = false;

        async function load() {
            try {
                setError(null);

                const result = await stdRequisitionsApi.getById(params.id);

                if (!cancelled) {
                    setRequisition(result);
                }
            } catch (err) {
                if (!cancelled) {
                    if (err instanceof ApiError && err.status === 404) {
                        setNotFound(true);
                        return;
                    }

                    setError(getApiErrorMessage(err, "Failed to load requisition."));
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
    }, [params.id, authLoading, canApprove]);

    if (authLoading || loading) {
        return (
            <PageContainer>
                <StdRequisitionShellSkeleton />
            </PageContainer>
        );
    }

    if (!canApprove) {
        return <NotFound />;
    }

    if (notFound) {
        return <NotFound />;
    }

    if (error) {
        return (
            <PageContainer>
                <Alert tone="danger">{error}</Alert>
            </PageContainer>
        );
    }

    if (!requisition) {
        return null;
    }

    return (
        <PageContainer>
            <StdRequisitionShell
                mode="approval"
                stdRequisition={requisition}
                submitWindowStatus={null}
                submitWindowStatusLoading={false}
                backHref="/standard-van-drivers/approvals"
            />
        </PageContainer>
    );
}