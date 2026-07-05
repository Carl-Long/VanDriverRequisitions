"use client";

import { useMemo } from "react";
import { Alert } from "@/components/ui/alert";
import type { StdRequisitionDetail } from "../../types/std-requisition.types";
import { useStdRequisitionDraft } from "../hooks/use-std-requisition-draft";
import { StdRequisitionTabs } from "../tabs/std-requisition-tabs";
import { StdCollectionChargeBanksAndBinsWorkspace } from "../collection-charges-banks-and-bins/std-collection-charge-banks-and-bins-workspace";
import { mapStdRequisitionDetailToDraft } from "../lib/map-std-requisition-detail-to-draft";
import { stdRequisitionsApi } from "../../api/std-requisitions-api";
import { mapStdRequisitionDraftToSaveRequest } from "../lib/map-std-requisition-draft-to-save-request";
import { stdRequisitionSchema } from "../schemas/std-requisition-schema";
import { SubmitWindowStatus } from "@/features/submit-windows/types/submit-window.types";
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
import { RequisitionFormErrorAlert } from "@/features/requisitions-shared/components/requisition-form-error-alert";
import { useRequisitionShellUiState } from "@/features/requisitions-shared/hooks/use-requisition-shell-ui-state";
import { SubmissionHistoryTab } from "@/features/requisitions-shared/components/submission-history-tab";
import { RequisitionFormHeader } from "@/features/requisitions-shared/components/requisition-form-header";
import { RequisitionPageMode } from "@/features/requisitions-shared/types/requisition-page-mode";
import { RequisitionDetailsTab } from "@/features/requisitions-shared/components/requisition-details-tab";
import { useRequisitionApprovalActions } from "@/features/requisitions-shared/hooks/use-requisition-approval-actions";
import { useStdRequisitionTabIssues } from "../hooks/use-std-requisition-tab-issues";
import { hasBlockingRequisitionTabIssue } from "@/features/requisitions-shared/types/requisition-tab-issue-severity";
import { useRequisitionPersistenceActions } from "@/features/requisitions-shared/hooks/use-requisition-persistence-actions";

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
    } = useRequisitionShellUiState({ initialActiveTabKey });



    const approvalActions = useRequisitionApprovalActions({
        mode,
        requisitionId: draft.requisitionId,
        rowVersion: draft.rowVersion,
        backHref,
        fallbackApprovalsHref: "/standard-van-drivers/approvals",
        approve: stdRequisitionsApi.approve,
        reject: stdRequisitionsApi.reject,
        clearAllErrors,
        setFormError: (message) => {
            setErrors({
                form: message,
            });
        },
    });

    const {
        handleSaveDraft,
        handleSaveAndContinue,
        handleSubmitRequest,
        handleSubmitConfirm,
    } = useRequisitionPersistenceActions({
        draft,
        subtotal,
        schema: stdRequisitionSchema,

        requisitionId: draft.requisitionId,

        backHref,
        listHref: "/standard-van-drivers",
        detailHref: (id) => `/standard-van-drivers/${id}`,

        create: stdRequisitionsApi.create,
        update: stdRequisitionsApi.update,
        submitNew: stdRequisitionsApi.submitNew,
        submitExisting: stdRequisitionsApi.submitExisting,

        mapDraftToSaveRequest: mapStdRequisitionDraftToSaveRequest,
        mapDetailToDraft: mapStdRequisitionDetailToDraft,
        replaceDraft,

        setActiveAction,
        setErrors,
        clearAllErrors,
        setActiveKey,
        setIsSubmitModalOpen,

        saveFailureMessage: "Failed to save requisition",
        submitFailureMessage: "Failed to submit requisition",
    });

    const isReadonly = mode === "readonly" || mode === "approval";

    const canSubmitStatus =
        draft.status === null || draft.status === "Draft" || draft.status === "Rejected";

    const canSubmit = canSubmitStatus && !!submitWindowStatus?.currentWindow;

    const vanPackRateChangeMessage = getStdCollectionVanPackRateChangeMessage(draft.collectionVanPacks, stdVanPackLimitRule,);

    const tabIssues = useStdRequisitionTabIssues({
        draft,
        isReadonly,
        stdMileageLimitRule,
        stdFlatChargeLimitRule,
        stdVanPackLimitRule,
    });

    const hasKnownSaveBlockers = hasBlockingRequisitionTabIssue([
        tabIssues.collectionChargesBanksAndBins,
        tabIssues.collectionVanPacks,
        tabIssues.pickups,
        tabIssues.transfers,
        tabIssues.additionalCosts,
    ]);

    const knownSaveBlockerMessage = hasKnownSaveBlockers
        ? "Please resolve the tab issues before saving or submitting this requisition."
        : null;

    const formErrorMessage = [errors.form, knownSaveBlockerMessage]
        .filter(Boolean)
        .join("\n");

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
                activeAction={activeAction ?? approvalActions.activeAction}
                canSubmit={canSubmit}
                hasKnownSaveBlockers={hasKnownSaveBlockers}
                submittedAtUtc={draft.submittedAtUtc}
                submittedByNameSnapshot={draft.submittedByNameSnapshot}
                onSaveDraft={handleSaveDraft}
                onSaveAndContinue={handleSaveAndContinue}
                onSubmit={handleSubmitRequest}
                onApprove={approvalActions.openApproveModal}
                onReject={approvalActions.openRejectModal}
            />

            <RequisitionFormErrorAlert message={formErrorMessage} />

            {!isReadonly && vanPackRateChangeMessage && (
                <Alert tone="warning">
                    {vanPackRateChangeMessage}
                </Alert>
            )}

            <StdRequisitionTabs
                activeKey={activeKey}
                onActiveKeyChange={setActiveKey}
                submissionHistoryCount={draft.submissionHistory.length}
                collectionChargesBanksAndBinsIssueSeverity={tabIssues.collectionChargesBanksAndBins}
                collectionVanPacksIssueSeverity={tabIssues.collectionVanPacks}
                pickupsIssueSeverity={tabIssues.pickups}
                transfersIssueSeverity={tabIssues.transfers}
                additionalCostsIssueSeverity={tabIssues.additionalCosts}
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
                        open={approvalActions.isApproveModalOpen}
                        loading={approvalActions.activeAction === "approve"}
                        onClose={approvalActions.closeApproveModal}
                        onConfirm={approvalActions.confirmApprove}
                    />

                    <RequisitionRejectModal
                        open={approvalActions.isRejectModalOpen}
                        loading={approvalActions.activeAction === "reject"}
                        onClose={approvalActions.closeRejectModal}
                        onConfirm={approvalActions.confirmReject}
                    />
                </>
            )}
        </div>
    );
}