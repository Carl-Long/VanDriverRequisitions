"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { BackLink } from "@/components/ui/navigation-back-link";
import { formatCurrencyGB } from "@/lib/format/currency";
import type { StdRequisitionDetail } from "../../types/std-requisition.types";
import type { StdRequisitionPageMode } from "../types/std-requisition-page-mode";
import { useStdRequisitionDraft } from "../hooks/use-std-requisition-draft";
import { StdRequisitionDetailsTab } from "../details/std-requisition-details-tab";
import { StdRequisitionTabs } from "../tabs/std-requisition-tabs";

type Props = {
    mode: StdRequisitionPageMode;
    stdRequisition?: StdRequisitionDetail;
    initialActiveTabKey?: string;
    backHref?: string;
};

export type StdSaveAction =
    | "saveAndContinue"
    | "saveAndClose"
    | "submit"
    | "approve"
    | "reject"
    | null;

export function StdRequisitionShell({
    mode,
    stdRequisition,
    initialActiveTabKey,
    backHref,
}: Readonly<Props>) {
    // We will map stdRequisition to draft in the next slice.
    // For now this supports the create page.
    const { draft, subtotal, setRequisitionDate, setVanDriver, setVanDriverName, setShop } =
        useStdRequisitionDraft();

    const [activeKey, setActiveKey] = useState(initialActiveTabKey ?? "details");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isReadonly = mode === "readonly" || mode === "approval";

    function clearError(field: string) {
        setErrors((prev) => {
            if (!prev[field]) {
                return prev;
            }

            const next = { ...prev };
            delete next[field];
            return next;
        });
    }

    const title =
        mode === "create"
            ? "Create New STD Requisition"
            : mode === "edit"
              ? "Editing STD Requisition"
              : mode === "approval"
                ? "Reviewing STD Requisition"
                : "Viewing STD Requisition";

    return (
        <div className="space-y-4">
            <div className="pb-2">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        {backHref && (
                            <>
                                <BackLink href={backHref} compact>
                                    Requisitions
                                </BackLink>

                                <div className="hidden h-4 w-px bg-border sm:block" />
                            </>
                        )}

                        <h1 className="flex flex-wrap items-center gap-3 text-lg font-semibold leading-none tracking-tight">
                            <span>{title}</span>

                            {mode !== "create" && draft.requisitionNumber && (
                                <span className="font-mono">{draft.requisitionNumber}</span>
                            )}
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-full border border-warning-border bg-warning-surface px-3 py-1 text-xs font-medium text-warning">
                            {draft.status ?? "Unsaved"}
                        </span>

                        <div className="h-4 w-px bg-border" />

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Subtotal</span>

                            <span className="font-medium tabular-nums">
                                {formatCurrencyGB(subtotal)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {stdRequisition && (
                <Alert tone="warning">
                    Edit/read mapping will be wired in the next slice. This shell currently supports
                    the create page foundation.
                </Alert>
            )}

            {errors.form && <Alert tone="danger">{errors.form}</Alert>}

            <StdRequisitionTabs
                activeKey={activeKey}
                onActiveKeyChange={setActiveKey}
                submissionHistoryCount={draft.submissionHistory.length}
                details={
                    <StdRequisitionDetailsTab
                        readonly={isReadonly}
                        draft={draft}
                        errors={errors}
                        clearError={clearError}
                        onRequisitionDateChange={setRequisitionDate}
                        onVanDriverChange={setVanDriver}
                        onVanDriverNameChange={setVanDriverName}
                        onShopChange={setShop}
                    />
                }
                collectionChargesBanksAndBins={
                    <Alert>
                        Banks & Bins rows will be added in the next slice. Select details first.
                    </Alert>
                }
                submissionHistory={
                    <Alert>
                        Submission history will be wired after save, submit, and submission view are
                        connected.
                    </Alert>
                }
            />
        </div>
    );
}