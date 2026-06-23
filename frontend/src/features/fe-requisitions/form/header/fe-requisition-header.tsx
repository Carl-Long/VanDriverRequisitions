"use client";

import type { SubmitWindowStatus } from "@/features/submit-windows/types/submit-window.types";
import type { RequisitionStatus } from "@/features/fe-requisitions/constants/fe-requisition-status.constants";
import { StatusPill } from "../../list/components/status-pill";
import { FeRequisitionActions } from "./fe-requisition-actions";
import { FeRequisitionApprovalActions } from "../approval/fe-requisition-approval-actions";
import type { FeRequisitionPageMode } from "../types/fe-requisition-page-mode";
import type { SaveAction } from "../components/fe-requisition-shell";
import { RequisitionHeader } from "@/features/requisitions-shared/components/requisition-header";

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

function UnsavedPill() {
    return (
        <span className="inline-flex items-center rounded-full border border-warning-border bg-warning-surface px-3 py-1 text-xs font-medium text-warning">
            Unsaved
        </span>
    );
}

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

    const showSubmitWindowStatus = mode !== "readonly" && mode !== "approval";

    const actions =
        mode !== "readonly" && mode !== "approval" ? (
            <FeRequisitionActions
                activeAction={activeAction}
                canSubmit={canSubmit}
                onSaveDraft={onSaveDraft}
                onSaveAndContinue={onSaveAndContinue}
                onSubmit={onSubmit}
            />
        ) : canApproveOrReject ? (
            <FeRequisitionApprovalActions
                activeAction={activeAction}
                onApprove={onApprove}
                onReject={onReject}
            />
        ) : null;

    return (
        <RequisitionHeader
            title={title}
            backHref={backHref}
            backLabel="Requisitions"
            requisitionNumber={mode === "create" ? null : requisitionNumber}
            statusNode={status ? <StatusPill status={status} /> : <UnsavedPill />}
            subtotal={subtotal}
            submitWindowStatus={submitWindowStatus}
            submitStatusLoading={submitStatusLoading}
            showSubmitWindowStatus={showSubmitWindowStatus}
            submittedAtUtc={showSubmittedBy ? submittedAtUtc : null}
            submittedByNameSnapshot={showSubmittedBy ? submittedByNameSnapshot : null}
            actions={actions}
        />
    );
}