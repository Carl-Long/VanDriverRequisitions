"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { BackLink } from "@/components/ui/navigation-back-link";
import { formatCurrencyGB } from "@/lib/format/currency";
import type { StdRequisitionDetail } from "../../types/std-requisition.types";
import type { StdRequisitionPageMode } from "../types/std-requisition-page-mode";
import { useStdRequisitionDraft } from "../hooks/use-std-requisition-draft";
import { StdRequisitionDetailsTab } from "../details/std-requisition-details-tab";
import { StdRequisitionTabs } from "../tabs/std-requisition-tabs";
import { StdCollectionChargeBanksAndBinsWorkspace } from "../collection-charges-banks-and-bins/std-collection-charge-banks-and-bins-workspace";
import { mapStdRequisitionDetailToDraft } from "../lib/map-std-requisition-detail-to-draft";
import { mapZodErrors } from "@/features/fe-requisitions/form/lib/map-zod-errors";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { stdRequisitionsApi } from "../../api/std-requisitions-api";
import { mapStdRequisitionDraftToSaveRequest } from "../lib/map-std-requisition-draft-to-save-request";
import { createStdRequisitionSchema } from "../schemas/std-requisition-schema";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/format/date";
import { SubmitWindowStatus } from "@/features/submit-windows/types/submit-window.types";
import { RequisitionSaveAction } from "@/features/requisitions-shared/types/requisition-save-action";
import { useToast } from "@/providers/toast-provider";
import { StdRequisitionHeader } from "../header/std-requisition-header";
import { RequisitionSubmitModal } from "@/features/requisitions-shared/components/requisition-submit-modal";
import { RequisitionApproveModal } from "@/features/requisitions-shared/components/requisition-approve-modal";
import { RequisitionRejectModal } from "@/features/requisitions-shared/components/requisition-reject-modal";



type Props = {
    mode: StdRequisitionPageMode;
    stdRequisition?: StdRequisitionDetail;
    submitWindowStatus: SubmitWindowStatus | null;
    submitWindowStatusLoading: boolean;
    initialActiveTabKey?: string;
    backHref?: string;
};

export function StdRequisitionShell({
    mode,
    stdRequisition,
    submitWindowStatus,
    submitWindowStatusLoading,
    initialActiveTabKey,
    backHref,
}: Readonly<Props>) {

    const router = useRouter();
    const initialDraft = useMemo(() => (stdRequisition ? mapStdRequisitionDetailToDraft(stdRequisition) : undefined), [stdRequisition]);

    const {
        draft,
        subtotal,
        replaceDraft,
        setRequisitionDate,
        setVanDriver,
        setVanDriverName,
        setShop,
        addCollectionChargeBanksAndBins,
        updateCollectionChargeBanksAndBins,
        removeCollectionChargeBanksAndBins,
    } = useStdRequisitionDraft(initialDraft);

    const [activeAction, setActiveAction] = useState<RequisitionSaveAction>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [activeKey, setActiveKey] = useState(initialActiveTabKey ?? "details");
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    const toast = useToast();

    const isReadonly = mode === "readonly" || mode === "approval";

    const canSubmitStatus =
        draft.status === null || draft.status === "Draft" || draft.status === "Rejected";

    const canSubmit = canSubmitStatus && !!submitWindowStatus?.currentWindow;

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

    async function saveRequisition(
        continueEditing: boolean = false,
    ): Promise<StdRequisitionDetail | undefined> {
        const result = createStdRequisitionSchema().safeParse(draft);

        if (!result.success) {
            setErrors(mapZodErrors(result.error));
            setActiveKey("details");
            return;
        }

        try {
            setErrors({});
            setIsSaving(true);

            const request = mapStdRequisitionDraftToSaveRequest(draft);

            let saved: StdRequisitionDetail;

            if (draft.requisitionId) {
                saved = await stdRequisitionsApi.update(draft.requisitionId, request);
            } else {
                saved = await stdRequisitionsApi.create(request);
            }

            replaceDraft(mapStdRequisitionDetailToDraft(saved));

            toast.success(`Requisition #${saved.requisitionNumber} saved`);

            if (continueEditing) {
                const editHref = `/standard-van-drivers/${saved.id}${backHref ? `?returnTo=${encodeURIComponent(backHref)}` : ""
                    }`;

                router.push(editHref);
            } else {
                router.push(backHref ?? "/standard-van-drivers");
            }

            return saved;
        } catch (err) {
            if (err instanceof ApiError) {
                setErrors({
                    form: getApiErrorMessage(err, "Failed to save requisition"),
                });

                return;
            }

            setErrors({
                form: "Failed to save requisition",
            });
        } finally {
            setIsSaving(false);
        }
    }

    async function submitRequisition() {
        const result = createStdRequisitionSchema().safeParse(draft);

        if (!result.success) {
            setErrors(mapZodErrors(result.error));
            setActiveKey("details");
            return;
        }

        try {
            setErrors({});
            setIsSaving(true);

            const request = mapStdRequisitionDraftToSaveRequest(draft);

            const submitted = draft.requisitionId
                ? await stdRequisitionsApi.submitExisting(draft.requisitionId, request)
                : await stdRequisitionsApi.submitNew(request);

            toast.success(`Requisition #${submitted.requisitionNumber} submitted`);

            router.push(backHref ?? "/standard-van-drivers");
        } catch (err) {
            if (err instanceof ApiError) {
                setErrors({
                    form: getApiErrorMessage(err, "Failed to submit requisition"),
                });

                return;
            }

            setErrors({
                form: "Failed to submit requisition",
            });
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSaveDraft() {
        setActiveAction("saveAndClose");

        try {
            await saveRequisition();
        } finally {
            setActiveAction(null);
        }
    }

    async function handleSaveAndContinue() {
        setActiveAction("saveAndContinue");

        try {
            await saveRequisition(true);
        } finally {
            setActiveAction(null);
        }
    }

    function handleSubmitRequest() {
        setIsSubmitModalOpen(true);
    }

    async function handleSubmitConfirm() {
        setIsSubmitModalOpen(false);
        setActiveAction("submit");

        try {
            await submitRequisition();
        } finally {
            setActiveAction(null);
        }
    }

    function handleApproveRequest() {
        if (mode !== "approval") {
            return;
        }

        setIsApproveModalOpen(true);
    }

    function handleRejectRequest() {
        if (mode !== "approval") {
            return;
        }

        setIsRejectModalOpen(true);
    }

    async function handleApproveConfirm() {
        if (!draft.requisitionId) {
            return;
        }

        setIsApproveModalOpen(false);
        setActiveAction("approve");

        try {
            setErrors({});
            setIsSaving(true);

            const approved = await stdRequisitionsApi.approve(draft.requisitionId, {
                rowVersion: draft.rowVersion,
            });

            toast.success(`Requisition #${approved.requisitionNumber} approved`);
            router.push("/standard-van-drivers/approvals");
        } catch (err) {
            if (err instanceof ApiError) {
                setErrors({
                    form: getApiErrorMessage(err, "Failed to approve requisition"),
                });

                return;
            }

            setErrors({ form: "Failed to approve requisition", });
        } finally {
            setIsSaving(false);
            setActiveAction(null);
        }
    }

    async function handleRejectConfirm(rejectionNotes: string) {
        if (!draft.requisitionId) {
            return;
        }

        setIsRejectModalOpen(false);
        setActiveAction("reject");

        try {
            setErrors({});
            setIsSaving(true);

            const rejected = await stdRequisitionsApi.reject(draft.requisitionId, {
                rowVersion: draft.rowVersion,
                rejectionNotes,
            });

            toast.success(`Requisition #${rejected.requisitionNumber} rejected`);
            router.push("/standard-van-drivers/approvals");
        } catch (err) {
            if (err instanceof ApiError) {
                setErrors({
                    form: getApiErrorMessage(err, "Failed to reject requisition"),
                });

                return;
            }

            setErrors({ form: "Failed to reject requisition", });
        } finally {
            setIsSaving(false);
            setActiveAction(null);
        }
    }

    const title =
        mode === "create"
            ? "Create New Requisition"
            : mode === "edit"
                ? "Editing STD Requisition"
                : mode === "approval"
                    ? "Reviewing Requisition"
                    : "Viewing Requisition";

    return (
        <div className="space-y-4">
            <StdRequisitionHeader
                mode={mode}
                backHref={backHref}
                requisitionNumber={draft.requisitionNumber}
                status={draft.status}
                subtotal={subtotal}
                submitWindowStatus={submitWindowStatus}
                submitStatusLoading={submitWindowStatusLoading}
                activeAction={activeAction}
                canSubmit={canSubmit}
                submittedAtUtc={draft.submittedAtUtc}
                submittedByNameSnapshot={draft.submittedByNameSnapshot}
                onSaveDraft={handleSaveDraft}
                onSaveAndContinue={handleSaveAndContinue}
                onSubmit={handleSubmitRequest}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
            />

            {errors.form && (
                <Alert tone="danger">
                    <ul className="list-disc space-y-1 pl-5">
                        {errors.form.split("\n").map((message) => (
                            <li key={message}>{message}</li>
                        ))}
                    </ul>
                </Alert>
            )}

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
                    <StdCollectionChargeBanksAndBinsWorkspace
                        readonly={isReadonly}
                        shopId={draft.shopId}
                        rows={draft.collectionChargesBanksAndBins}
                        onAdd={(form) => {
                            addCollectionChargeBanksAndBins(form);
                            clearError("collectionChargesBanksAndBins");
                            clearError("form");
                        }}
                        onUpdate={(clientId, form) => {
                            updateCollectionChargeBanksAndBins(clientId, form);
                            clearError("collectionChargesBanksAndBins");
                            clearError("form");
                        }}
                        onDelete={removeCollectionChargeBanksAndBins}
                    />
                }
                submissionHistory={
                    <Alert>
                        Submission history will be wired after save, submit, and submission view are
                        connected.
                    </Alert>
                }
            />

            {canSubmit && (
                <RequisitionSubmitModal
                    open={isSubmitModalOpen}
                    loading={activeAction === "submit"}
                    detailLabel="collection details"
                    onClose={() => setIsSubmitModalOpen(false)}
                    onConfirm={handleSubmitConfirm}
                />
            )}

            {mode === "approval" && (
                <>
                    <RequisitionApproveModal
                        open={isApproveModalOpen}
                        loading={activeAction === "approve"}
                        onClose={() => setIsApproveModalOpen(false)}
                        onConfirm={handleApproveConfirm}
                    />

                    <RequisitionRejectModal
                        open={isRejectModalOpen}
                        loading={activeAction === "reject"}
                        onClose={() => setIsRejectModalOpen(false)}
                        onConfirm={handleRejectConfirm}
                    />
                </>
            )}
        </div>
    );
}