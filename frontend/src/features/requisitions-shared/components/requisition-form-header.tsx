"use client";

import type { SubmitWindowStatus } from "@/features/submit-windows/types/submit-window.types";

import { RequisitionActions } from "./requisition-actions";
import { RequisitionApprovalActions } from "./requisition-approval-actions";
import { RequisitionHeader } from "./requisition-header";
import { RequisitionStatusPill } from "./requisition-status-pill";
import type { RequisitionStatus } from "../constants/requisition-status.constants";
import type { RequisitionSaveAction } from "../types/requisition-save-action";
import type { RequisitionPageMode } from "../types/requisition-page-mode";

type Props = {
    mode: RequisitionPageMode;
    backHref?: string;
    requisitionNumber?: string | null;
    status: RequisitionStatus | null;
    subtotal: number;
    submitWindowStatus: SubmitWindowStatus | null;
    submitStatusLoading: boolean;
    activeAction: RequisitionSaveAction;
    canSubmit: boolean;
    submittedAtUtc: string | null;
    submittedByNameSnapshot: string | null;
    hasKnownSaveBlockers?: boolean;
    onSaveDraft: () => void;
    onSaveAndContinue: () => void;
    onSubmit: () => void;
    onApprove: () => void;
    onReject: () => void;
};

const TITLES: Record<RequisitionPageMode, string> = {
    create: "Create New Requisition",
    edit: "Editing Requisition",
    readonly: "Viewing Requisition",
    approval: "Reviewing Requisition",
};

function UnsavedPill() {
    return (
        <span className="inline-flex items-center rounded-full border border-warning-border bg-warning-surface px-3 py-1 text-xs font-medium text-warning">
            Unsaved
        </span>
    );
}

export function RequisitionFormHeader({
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
    hasKnownSaveBlockers = false,
    onSaveDraft,
    onSaveAndContinue,
    onSubmit,
    onApprove,
    onReject,
}: Readonly<Props>) {
    const canApproveOrReject = mode === "approval" && status === "Submitted";

    const showSubmittedBy =
        (status === "Submitted" || status === "Approved") &&
        !!submittedByNameSnapshot;

    const showSubmitWindowStatus = mode !== "readonly" && mode !== "approval";

    const actions = getHeaderActions({
        mode,
        activeAction,
        canSubmit,
        hasKnownSaveBlockers,
        canApproveOrReject,
        onSaveDraft,
        onSaveAndContinue,
        onSubmit,
        onApprove,
        onReject,
    });

    type HeaderActionsOptions = {
        mode: RequisitionPageMode;
        activeAction: RequisitionSaveAction;
        canSubmit: boolean;
        hasKnownSaveBlockers: boolean;
        canApproveOrReject: boolean;
        onSaveDraft: () => void;
        onSaveAndContinue: () => void;
        onSubmit: () => void;
        onApprove: () => void;
        onReject: () => void;
    };

    function getHeaderActions({
        mode,
        activeAction,
        canSubmit,
        hasKnownSaveBlockers,
        canApproveOrReject,
        onSaveDraft,
        onSaveAndContinue,
        onSubmit,
        onApprove,
        onReject,
    }: HeaderActionsOptions) {
        if (mode !== "readonly" && mode !== "approval") {
            return (
                <RequisitionActions
                    activeAction={activeAction}
                    canSubmit={canSubmit}
                    hasKnownSaveBlockers={hasKnownSaveBlockers}
                    onSaveDraft={onSaveDraft}
                    onSaveAndContinue={onSaveAndContinue}
                    onSubmit={onSubmit}
                />
            );
        }

        if (canApproveOrReject) {
            return (
                <RequisitionApprovalActions
                    activeAction={activeAction}
                    onApprove={onApprove}
                    onReject={onReject}
                />
            );
        }

        return null;
    }

    return (
        <RequisitionHeader
            title={TITLES[mode]}
            backHref={backHref}
            backLabel="Requisitions"
            requisitionNumber={mode === "create" ? null : requisitionNumber}
            statusNode={
                status ? <RequisitionStatusPill status={status} /> : <UnsavedPill />
            }
            subtotal={subtotal}
            submitWindowStatus={submitWindowStatus}
            submitStatusLoading={submitStatusLoading}
            showSubmitWindowStatus={showSubmitWindowStatus}
            submittedAtUtc={showSubmittedBy ? submittedAtUtc : null}
            submittedByNameSnapshot={
                showSubmittedBy ? submittedByNameSnapshot : null
            }
            actions={actions}
        />
    );
}