"use client";

import type { ReactNode } from "react";
import { Calendar, User } from "lucide-react";

import { BackLink } from "@/components/ui/navigation-back-link";
import { formatCurrencyGB } from "@/lib/format/currency";
import { formatDateTime } from "@/lib/format/date";
import type { SubmitWindowStatus } from "@/features/submit-windows/types/submit-window.types";
import { RequisitionSubmitStatus } from "./requisition-submit-status";

type Props = {
    title: string;
    backHref?: string;
    backLabel?: string;
    requisitionNumber?: string | null;
    statusNode: ReactNode;
    subtotal: number;
    submitWindowStatus: SubmitWindowStatus | null;
    submitStatusLoading: boolean;
    showSubmitWindowStatus: boolean;
    submittedAtUtc?: string | null;
    submittedByNameSnapshot?: string | null;
    actions?: ReactNode;
};

export function RequisitionHeader({
    title,
    backHref,
    backLabel = "Requisitions",
    requisitionNumber,
    statusNode,
    subtotal,
    submitWindowStatus,
    submitStatusLoading,
    showSubmitWindowStatus,
    submittedAtUtc,
    submittedByNameSnapshot,
    actions,
}: Readonly<Props>) {
    const showSubmittedBy = !!submittedByNameSnapshot;

    return (
        <div className="pb-2">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            {backHref && (
                                <>
                                    <BackLink href={backHref} compact>
                                        {backLabel}
                                    </BackLink>

                                    <div className="hidden h-4 w-px bg-border sm:block" />
                                </>
                            )}

                            <h1 className="flex flex-wrap items-center gap-3 text-lg font-semibold leading-none tracking-tight">
                                <span>{title}</span>

                                {requisitionNumber && (
                                    <span className="font-mono">{requisitionNumber}</span>
                                )}
                            </h1>
                        </div>
                    </div>

                    {showSubmitWindowStatus && (
                        <RequisitionSubmitStatus
                            status={submitWindowStatus}
                            loading={submitStatusLoading}
                        />
                    )}
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                            {statusNode}

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

                    {actions}
                </div>
            </div>
        </div>
    );
}