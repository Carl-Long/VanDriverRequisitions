"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";

import { feRequisitionsApi, FeRequisitionDetail, } from "@/lib/api/fe-requisitions";

import { FeRequisitionShell } from "@/components/fe-requisitions/fe-requisition-form/components/fe-requisition-shell";

import { useToast } from "@/providers/toast-provider";
import { useRequisitionLimitRules } from "@/components/fe-requisitions/fe-requisition-form/hooks/use-requisition-limit-rules";

export default function Page() {

    const params = useParams<{ id: string }>();
    const router = useRouter();
    const toast = useToast();
    const { limitRules } = useRequisitionLimitRules();
    const [requisition, setRequisition] = useState<FeRequisitionDetail | null>(null);
    const [loading, setLoading] = useState(true);

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
                    setLoading(false);
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
            {loading || !requisition ? (
                <div>
                    Loading requisition...
                </div>
            ) : (
                <FeRequisitionShell
                    mode={
                        requisition.isEditable
                            ? "edit"
                            : "readonly"
                    }
                    feRequisition={
                        requisition
                    }
                    limitRules={limitRules}
                />
            )}
        </PageContainer>
    );
}