"use client";

import { useMemo } from "react";
import { Alert } from "@/components/ui/alert";
import type { StdRequisitionDetail } from "../../types/std-requisition.types";
import { useStdRequisitionDraft } from "../hooks/use-std-requisition-draft";
import { StdRequisitionTabs } from "../tabs/std-requisition-tabs";
import { StdCollectionChargeBanksAndBinsWorkspace } from "../collection-charges-banks-and-bins/std-collection-charge-banks-and-bins-workspace";
import { mapStdRequisitionDetailToDraft } from "../lib/map-std-requisition-detail-to-draft";
import { mapZodErrors } from "@/features/requisitions-shared/lib/map-zod-errors";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { stdRequisitionsApi } from "../../api/std-requisitions-api";
import { mapStdRequisitionDraftToSaveRequest } from "../lib/map-std-requisition-draft-to-save-request";
import { stdRequisitionSchema } from "../schemas/std-requisition-schema";
import { useRouter } from "next/navigation";
import { SubmitWindowStatus } from "@/features/submit-windows/types/submit-window.types";
import { useToast } from "@/providers/toast-provider";
import { RequisitionSubmitModal } from "@/features/requisitions-shared/components/requisition-submit-modal";
import { RequisitionApproveModal } from "@/features/requisitions-shared/components/requisition-approve-modal";
import { RequisitionRejectModal } from "@/features/requisitions-shared/components/requisition-reject-modal";
import { STD_REQUISITION_ROW_CATEGORIES } from "../../constants/std-requisition-row-categories";
import { resolveStdRequisitionLimitRule } from "../lib/resolve-std-requisition-limit-rule";
import { StdCollectionVanPackWorkspace } from "../collection-van-packs/std-collection-van-pack-workspace";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { getStdCollectionVanPackRateChangeMessage } from "../lib/get-std-collection-van-pack-rate-change-message";
import { StdPickupWorkspace } from "../collection-pickups/std-pickup-workspace";
import { StdTransferWorkspace } from "../transfers/std-transfer-workspace";
import { StdAdditionalCostWorkspace } from "../additional-costs/std-additional-cost-workspace";
import { useStdRequisitionTabWarnings } from "../hooks/use-std-requisition-tab-warnings";
import { RequisitionFormErrorAlert } from "@/features/requisitions-shared/components/requisition-form-error-alert";
import { useRequisitionShellUiState } from "@/features/requisitions-shared/hooks/use-requisition-shell-ui-state";
import { withReturnTo } from "@/features/requisitions-shared/lib/get-safe-return-to";
import { getSubmitSubtotalError } from "@/features/requisitions-shared/lib/get-submit-total-error";
import { SubmissionHistoryTab } from "@/features/requisitions-shared/components/submission-history-tab";
import { RequisitionFormHeader } from "@/features/requisitions-shared/components/requisition-form-header";
import { RequisitionPageMode } from "@/features/requisitions-shared/types/requisition-page-mode";
import { RequisitionDetailsTab } from "@/features/requisitions-shared/components/requisition-details-tab";

type Props = {
    mode: RequisitionPageMode;
    stdRequisition?: StdRequisitionDetail;
    limitRules: RequisitionLimitRuleSummary[];
    submitWindowStatus: SubmitWindowStatus | null;
    submitWindowStatusLoading: boolean;
    initialActiveTabKey?: string;
    backHref?: string;
};

export function StdRequisitionShell({
    mode,
    stdRequisition,
    limitRules,
    submitWindowStatus,
    submitWindowStatusLoading,
    initialActiveTabKey,
    backHref,
}: Readonly<Props>) {

    const router = useRouter();
    const initialDraft = useMemo(() => (stdRequisition ? mapStdRequisitionDetailToDraft(stdRequisition) : undefined), [stdRequisition]);
    const stdMileageLimitRule = resolveStdRequisitionLimitRule({ rules: limitRules, category: STD_REQUISITION_ROW_CATEGORIES.MILEAGE, });
    const stdFlatChargeLimitRule = resolveStdRequisitionLimitRule({ rules: limitRules, category: STD_REQUISITION_ROW_CATEGORIES.FLAT_CHARGE });
    const stdVanPackLimitRule = resolveStdRequisitionLimitRule({ rules: limitRules, category: STD_REQUISITION_ROW_CATEGORIES.VAN_PACK, });

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
        addCollectionVanPack,
        updateCollectionVanPack,
        removeCollectionVanPack,
        addPickup,
        updatePickup,
        removePickup,
        addTransfer,
        updateTransfer,
        removeTransfer,
        addAdditionalCost,
        updateAdditionalCost,
        removeAdditionalCost,
    } = useStdRequisitionDraft(initialDraft);

    const {
        activeAction,
        setActiveAction,
        errors,
        setErrors,
        clearError,
        clearAllErrors,
        activeKey,
        setActiveKey,
        isSubmitModalOpen,
        setIsSubmitModalOpen,
        isApproveModalOpen,
        setIsApproveModalOpen,
        isRejectModalOpen,
        setIsRejectModalOpen,
    } = useRequisitionShellUiState({ initialActiveTabKey });


    const toast = useToast();

    const isReadonly = mode === "readonly" || mode === "approval";

    const canSubmitStatus =
        draft.status === null || draft.status === "Draft" || draft.status === "Rejected";

    const canSubmit = canSubmitStatus && !!submitWindowStatus?.currentWindow;

    const vanPackRateChangeMessage = getStdCollectionVanPackRateChangeMessage(draft.collectionVanPacks, stdVanPackLimitRule,);

    const tabWarnings = useStdRequisitionTabWarnings({
        draft,
        isReadonly,
        stdMileageLimitRule,
        stdFlatChargeLimitRule,
        stdVanPackLimitRule,
    });

    async function saveRequisition(
        continueEditing: boolean = false,
    ): Promise<StdRequisitionDetail | undefined> {
        const result = stdRequisitionSchema.safeParse(draft);

        if (!result.success) {
            setErrors(mapZodErrors(result.error));
            setActiveKey("details");
            return;
        }

        try {
            clearAllErrors();

            const request = mapStdRequisitionDraftToSaveRequest(draft);

            const saved = draft.requisitionId
                ? await stdRequisitionsApi.update(draft.requisitionId, request)
                : await stdRequisitionsApi.create(request);

            replaceDraft(mapStdRequisitionDetailToDraft(saved));

            toast.success(`Requisition #${saved.requisitionNumber} saved`);

            if (continueEditing) {
                router.push(withReturnTo(`/standard-van-drivers/${saved.id}`, backHref));
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
        }
    }

    async function submitRequisition() {
        const result = stdRequisitionSchema.safeParse(draft);

        if (!result.success) {
            setErrors(mapZodErrors(result.error));
            setActiveKey("details");
            return;
        }

        const subtotalError = getSubmitSubtotalError(subtotal);

        if (subtotalError) {
            setErrors({
                form: subtotalError,
            });

            return;
        }

        try {
            clearAllErrors();

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
            clearAllErrors();

            const approved = await stdRequisitionsApi.approve(draft.requisitionId, {
                rowVersion: draft.rowVersion,
            });

            toast.success(`Requisition #${approved.requisitionNumber} approved`);
            router.push(backHref ?? "/standard-van-drivers/approvals");
        } catch (err) {
            if (err instanceof ApiError) {
                setErrors({
                    form: getApiErrorMessage(err, "Failed to approve requisition"),
                });

                return;
            }

            setErrors({
                form: "Failed to approve requisition",
            });
        } finally {
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
            clearAllErrors();

            const rejected = await stdRequisitionsApi.reject(draft.requisitionId, {
                rowVersion: draft.rowVersion,
                rejectionNotes,
            });

            toast.success(`Requisition #${rejected.requisitionNumber} rejected`);
            router.push(backHref ?? "/standard-van-drivers/approvals");
        } catch (err) {
            if (err instanceof ApiError) {
                setErrors({
                    form: getApiErrorMessage(err, "Failed to reject requisition"),
                });

                return;
            }

            setErrors({
                form: "Failed to reject requisition",
            });
        } finally {
            setActiveAction(null);
        }
    }

    return (
        <div className="space-y-4">
            <RequisitionFormHeader
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

            <RequisitionFormErrorAlert message={errors.form} />

            {!isReadonly && vanPackRateChangeMessage && (
                <Alert tone="warning">
                    {vanPackRateChangeMessage}
                </Alert>
            )}

            <StdRequisitionTabs
                activeKey={activeKey}
                onActiveKeyChange={setActiveKey}
                submissionHistoryCount={draft.submissionHistory.length}
                collectionChargesBanksAndBinsHasWarning={tabWarnings.collectionChargesBanksAndBinsHasWarning}
                collectionVanPacksHasWarning={tabWarnings.collectionVanPacksHasWarning}
                pickupsHasWarning={tabWarnings.pickupsHasWarning}
                transfersHasWarning={tabWarnings.transfersHasWarning}
                additionalCostsHasWarning={tabWarnings.additionalCostsHasWarning}
                details={
                    <RequisitionDetailsTab
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
                        mileageLimitRule={stdMileageLimitRule}
                        flatChargeLimitRule={stdFlatChargeLimitRule}
                        onAdd={(form) => {
                            addCollectionChargeBanksAndBins(form);
                            clearError("form");
                        }}
                        onUpdate={(clientId, form) => {
                            updateCollectionChargeBanksAndBins(clientId, form);
                            clearError("form");
                        }}
                        onDelete={removeCollectionChargeBanksAndBins}
                    />
                }
                collectionVanPacks={
                    <StdCollectionVanPackWorkspace
                        readonly={isReadonly}
                        rows={draft.collectionVanPacks}
                        vanPackLimitRule={stdVanPackLimitRule}
                        onAdd={(form, ratePerVanPack) => {
                            addCollectionVanPack(form, ratePerVanPack);
                            clearError("form");
                        }}
                        onUpdate={(clientId, form, ratePerVanPack) => {
                            updateCollectionVanPack(clientId, form, ratePerVanPack);
                            clearError("form");
                        }}
                        onDelete={removeCollectionVanPack}
                    />
                }
                pickups={
                    <StdPickupWorkspace
                        readonly={isReadonly}
                        rows={draft.pickups}
                        mileageLimitRule={stdMileageLimitRule}
                        flatChargeLimitRule={stdFlatChargeLimitRule}
                        onAdd={(form) => {
                            addPickup(form);
                            clearError("form");
                        }}
                        onUpdate={(clientId, form) => {
                            updatePickup(clientId, form);
                            clearError("form");
                        }}
                        onDelete={removePickup}
                    />
                }
                transfers={
                    <StdTransferWorkspace
                        readonly={isReadonly}
                        rows={draft.transfers}
                        mileageLimitRule={stdMileageLimitRule}
                        flatChargeLimitRule={stdFlatChargeLimitRule}
                        onAdd={(form) => {
                            addTransfer(form);
                            clearError("form");
                        }}
                        onUpdate={(clientId, form) => {
                            updateTransfer(clientId, form);
                            clearError("form");
                        }}
                        onDelete={removeTransfer}
                    />
                }
                additionalCosts={
                    <StdAdditionalCostWorkspace
                        readonly={isReadonly}
                        rows={draft.additionalCosts}
                        mileageLimitRule={stdMileageLimitRule}
                        flatChargeLimitRule={stdFlatChargeLimitRule}
                        onAdd={(form) => {
                            addAdditionalCost(form);
                            clearError("form");
                        }}
                        onUpdate={(clientId, form) => {
                            updateAdditionalCost(clientId, form);
                            clearError("form");
                        }}
                        onDelete={removeAdditionalCost}
                    />
                }
                submissionHistory={
                    <SubmissionHistoryTab
                        submissions={draft.submissionHistory}
                        submissionBasePath="/standard-van-drivers/submissions"
                        returnTo={backHref}
                    />
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