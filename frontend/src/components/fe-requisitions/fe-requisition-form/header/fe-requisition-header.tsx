"use client";

import { formatCurrencyGB } from "@/lib/format/currency";
import { StatusPill } from "../../status-pill";
import { RequisitionStatus } from "../../constants";
import { FeRequisitionActions } from "./fe-requisition-actions";
import { FeRequisitionSubmitStatus } from "./fe-requisition-submit-status";
import { FeRequisitionPageMode } from "../types/fe-requisition-page-mode";
import { SaveAction } from "../components/fe-requisition-shell";
import { SubmitWindowStatus } from "@/lib/api/submit-windows";
import { formatDateTime } from "@/lib/format/date";
import { User, Calendar } from "lucide-react";


type Props = {
    mode: FeRequisitionPageMode;
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
};

export function FeRequisitionHeader({
    mode,
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
}: Readonly<Props>) {

    return (
        <div className="pb-2">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <h1 className="flex flex-wrap items-center gap-3 font-semibold text-lg leading-none tracking-tight">
                            <span>
                                {mode === "create"
                                    ? "Create New Requisition"
                                    : mode === "readonly"
                                        ? "Viewing Requisition"
                                        : "Editing Requisition"}

                            </span>

                            {mode !== "create" && requisitionNumber && (
                                <span className="font-mono">
                                    {requisitionNumber}
                                </span>
                            )}
                        </h1>
                    </div>

                    {mode !== "readonly" && (
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
                                <span className="text-sm text-muted-foreground">
                                    Subtotal
                                </span>

                                <span className="font-medium tabular-nums">
                                    {formatCurrencyGB(subtotal)}
                                </span>
                            </div>
                        </div>

                        {submittedByNameSnapshot && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">
                                        Submitted by {submittedByNameSnapshot}
                                    </span>
                                    {submittedAtUtc && (
                                        <>
                                            <span className="text-muted-foreground">
                                                •
                                            </span>

                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>
                                                    {formatDateTime(submittedAtUtc)}
                                                </span>
                                            </span>
                                        </>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>

                    {mode !== "readonly" && (
                        <FeRequisitionActions
                            activeAction={activeAction}
                            canSubmit={canSubmit}
                            onSaveDraft={onSaveDraft}
                            onSaveAndContinue={onSaveAndContinue}
                            onSubmit={onSubmit}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
