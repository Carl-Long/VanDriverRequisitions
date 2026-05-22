"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { RequisitionForm } from "@/components/fe-requisitions/requisition-form";
import { useToast } from "@/components/ui/toast/toast";
import { feRequisitionsApi, type FeRequisitionDetail } from "@/lib/api/fe-requisitions";

export default function EditRequisitionPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const toast = useToast();
    const [detail, setDetail] = useState<FeRequisitionDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const result = await feRequisitionsApi.getById(params.id);
                if (!cancelled) {
                    setDetail(result);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    toast.error(
                        (err as { detail?: string })?.detail ?? "Failed to load requisition.",
                    );
                    router.push("/home-van-drivers");
                }
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [params.id, router, toast]);

    return (
        <PageContainer>
            <PageHeader
                title={detail ? `Requisition ${detail.requisitionNumber}` : "Requisition"}
                description={
                    detail
                        ? `${detail.tradersName} — ${detail.shopCode} ${detail.shopName}`
                        : "Loading…"
                }
            />
            {loading || !detail ? (
                <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
                    Loading requisition…
                </div>
            ) : (
                <RequisitionForm initial={detail} />
            )}
        </PageContainer>
    );
}
