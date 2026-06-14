"use client";

import { formatCurrencyGB } from "@/lib/format/currency";
import { FeRequisitionActions } from "./fe-requisition-actions";
import { FeRequisitionSubmitStatus } from "./fe-requisition-submit-status";
import { FeRequisitionPageMode } from "../types/fe-requisition-page-mode";
import { SaveAction } from "../components/fe-requisition-shell";
import { formatDateTime } from "@/lib/format/date";
import { User, Calendar, ArrowLeft } from "lucide-react";
import { FeRequisitionApprovalActions } from "../approval/fe-requisition-approval-actions";
import { SubmitWindowStatus } from "@/features/submit-windows/types/submit-window.types";
import { RequisitionStatus } from "@/features/fe-requisitions/constants/fe-requisition-status.constants";
import { StatusPill } from "../../list/components/status-pill";
import Link from "next/link";
import { BackLink } from "@/components/ui/navigation-back-link";

type Props = {
    mode: FeRequisitionPageMode;
    backHref?: string;
    requisitionNumber?: string | null;
    status: RequisitionStatus | null;
    subtotal: number;
    submitWindowStatus: SubmitWindowStatus | null;
    submitStatusLoading: boolean;
    activeAction: SaveAction;
    canSubmit: boolean;
    submittedAtUtc: string | null;
    submittedByNameSnapshot: string | null;
    onSaveDraft: () => void;
    onSaveAndContinue: () => void;
    onSubmit: () => void;
    onApprove: () => void;
    onReject: () => void;
};

export function FeRequisitionHeader({
    mode,
    backHref,
    requisitionNumber,
    status,
    subtotal,
    submitWindowStatus,
    submitStatusLoading,
    activeAction,
    canSubmit,
    submittedAtUtc,
    submittedByNameSnapshot,
    onSaveDraft,
    onSaveAndContinue,
    onSubmit,
    onApprove,
    onReject,
}: Readonly<Props>) {
    const TITLES: Record<FeRequisitionPageMode, string> = {
        create: "Create New Requisition",
        edit: "Editing Requisition",
        readonly: "Viewing Requisition",
        approval: "Reviewing Requisition",
    };

    const title = TITLES[mode];

    const canApproveOrReject = mode === "approval" && status === "Submitted";
    const showSubmittedBy =
        (status === "Submitted" || status === "Approved") && !!submittedByNameSnapshot;

    return (
        <div className="pb-2">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            {backHref && (
                                <>
                                    <BackLink href={backHref} compact>
                                        Requisitions
                                    </BackLink>
                                    
                                    <div className="hidden h-4 w-px bg-border sm:block" />
                                </>
                            )}

                            <h1 className="flex flex-wrap items-center gap-3 font-semibold text-lg leading-none tracking-tight">
                                <span>{title}</span>

                                {mode !== "create" && requisitionNumber && (
                                    <span className="font-mono">{requisitionNumber}</span>
                                )}
                            </h1>
                        </div>
                    </div>
                    {mode !== "readonly" && mode !== "approval" && (
                        <FeRequisitionSubmitStatus
                            status={submitWindowStatus}
                            loading={submitStatusLoading}
                        />
                    )}
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-2">
                        {/* Row 1: status + subtotal */}
                        <div className="flex flex-wrap items-center gap-3">
                            {status ? (
                                <StatusPill status={status} />
                            ) : (
                                <span className="inline-flex items-center rounded-full border border-warning-border bg-warning-surface px-3 py-1 text-xs font-medium text-warning">
                                    Unsaved
                                </span>
                            )}

                            <div className="h-4 w-px bg-border" />

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Subtotal</span>

                                <span className="font-medium tabular-nums">
                                    {formatCurrencyGB(subtotal)}
                                </span>
                            </div>
                        </div>

                        {showSubmittedBy && (
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />

                                <span className="font-medium text-foreground">
                                    Submitted by {submittedByNameSnapshot}
                                </span>

                                {submittedAtUtc && (
                                    <>
                                        <span className="text-muted-foreground">•</span>

                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />

                                            <span>{formatDateTime(submittedAtUtc)}</span>
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {mode !== "readonly" && mode !== "approval" && (
                        <FeRequisitionActions
                            activeAction={activeAction}
                            canSubmit={canSubmit}
                            onSaveDraft={onSaveDraft}
                            onSaveAndContinue={onSaveAndContinue}
                            onSubmit={onSubmit}
                        />
                    )}

                    {canApproveOrReject && (
                        <FeRequisitionApprovalActions
                            activeAction={activeAction}
                            onApprove={onApprove}
                            onReject={onReject}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
