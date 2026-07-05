"use client";

import { REQUISITION_ROW_CATEGORIES } from "@/features/fe-requisitions/constants/requisition-row-categories";
import { FeGeneralTaskWorkspace } from "../general-tasks/fe-general-task-workspace";
import { useFeRequisitionDraft } from "../hooks/use-fe-requisition-draft";
import { resolveFeRequisitionLimitRule } from "../lib/resolve-fe-requisition-limit-rule";
import { FeRequisitionTabs } from "../tabs/fe-requisition-tabs";
import { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { useMemo } from "react";
import { feRequisitionSchema } from "../schemas/fe-requisition-schema";
import { mapFeRequisitionDraftToSaveRequest } from "../lib/map-fe-requisition-draft-to-save-request";
import { mapZodErrors } from "../../../requisitions-shared/lib/map-zod-errors";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/toast-provider";
import { mapFeRequisitionDetailToDraft } from "../lib/map-fe-requisition-detail-to-draft";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { FeTaskType } from "@/features/fe-task-types/fe-task-types-api";
import { SubmitWindowStatus } from "@/features/submit-windows/types/submit-window.types";
import { feRequisitionsApi } from "@/features/fe-requisitions/api/fe-requisitions-api";
import { FeRequisitionDetail } from "@/features/fe-requisitions/types/fe-requisition.types";
import { FeMileageWorkspace } from "../mileage/fe-mileage-workspace";
import { FeTransferWorkspace } from "../transfers/fe-transfer-workspace";
import { FeAdditionalCostWorkspace } from "../additional-costs/fe-additional-cost-workspace";
import { RequisitionSubmitModal } from "@/features/requisitions-shared/components/requisition-submit-modal";
import { RequisitionApproveModal } from "@/features/requisitions-shared/components/requisition-approve-modal";
import { RequisitionRejectModal } from "@/features/requisitions-shared/components/requisition-reject-modal";
import { RequisitionFormErrorAlert } from "@/features/requisitions-shared/components/requisition-form-error-alert";
import { useRequisitionShellUiState } from "@/features/requisitions-shared/hooks/use-requisition-shell-ui-state";
import { withReturnTo } from "@/features/requisitions-shared/lib/get-safe-return-to";
import { getSubmitSubtotalError } from "@/features/requisitions-shared/lib/get-submit-total-error";
import { SubmissionHistoryTab } from "@/features/requisitions-shared/components/submission-history-tab";
import { RequisitionPageMode } from "@/features/requisitions-shared/types/requisition-page-mode";
import { RequisitionFormHeader } from "@/features/requisitions-shared/components/requisition-form-header";
import { RequisitionDetailsTab } from "@/features/requisitions-shared/components/requisition-details-tab";
import { useRequisitionApprovalActions } from "@/features/requisitions-shared/hooks/use-requisition-approval-actions";
import { useFeRequisitionTabIssues } from "../hooks/use-fe-requisition-tab-issues";

type Props = {
    mode: RequisitionPageMode;
    limitRules: RequisitionLimitRuleSummary[];
    taskTypes: FeTaskType[];
    submitWindowStatus: SubmitWindowStatus | null;
    submitWindowStatusLoading: boolean;
    feRequisition?: FeRequisitionDetail;
    initialActiveTabKey?: string;
    backHref?: string;
};


export function FeRequisitionShell({
    mode,
    limitRules,
    taskTypes,
    feRequisition,
    submitWindowStatus,
    submitWindowStatusLoading,
    initialActiveTabKey,
    backHref,
}: Readonly<Props>) {
    const initialDraft = feRequisition ? mapFeRequisitionDetailToDraft(feRequisition) : undefined;

    const {
        draft,
        subtotal,
        setRequisitionDate,
        setVanDriver,
        setVanDriverName,
        setShop,
        addGeneralTask,
        updateGeneralTask,
        removeGeneralTask,
        addMileage,
        updateMileage,
        removeMileage,
        addTransfer,
        updateTransfer,
        removeTransfer,
        addAdditionalCost,
        updateAdditionalCost,
        removeAdditionalCost,
        replaceDraft,
    } = useFeRequisitionDraft(initialDraft);

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

    const isReadonly = mode === "readonly" || mode === "approval";

    const usedTaskTypeIds = useMemo(
        () =>
            new Set(
                draft.feGeneralTasks
                    .map((task) => task.taskTypeId)
                    .filter((id): id is string => Boolean(id)),
            ),
        [draft.feGeneralTasks],
    );

    const tabIssues = useFeRequisitionTabIssues({ draft, isReadonly, limitRules });

    const router = useRouter();
    const toast = useToast();

    const approvalActions = useRequisitionApprovalActions({
        mode,
        requisitionId: draft.requisitionId,
        rowVersion: draft.rowVersion,
        backHref,
        fallbackApprovalsHref: "/home-van-drivers/approvals",
        approve: feRequisitionsApi.approve,
        reject: feRequisitionsApi.reject,
        clearAllErrors,
        setFormError: (message) => {
            setErrors({
                form: message,
            });
        },
    });

    const canSubmitStatus =
        draft.status === null || draft.status === "Draft" || draft.status === "Rejected";

    const canSubmit = canSubmitStatus && !!submitWindowStatus?.currentWindow;

    async function saveRequisition(
        continueEditing: boolean = false,
    ): Promise<FeRequisitionDetail | undefined> {
        const result = feRequisitionSchema.safeParse(draft);

        if (!result.success) {
            setErrors(mapZodErrors(result.error));
            setActiveKey("details");
            return;
        }

        try {
            clearAllErrors();

            const request = mapFeRequisitionDraftToSaveRequest(draft);

            const saved = draft.requisitionId
                ? await feRequisitionsApi.update(draft.requisitionId, request)
                : await feRequisitionsApi.create(request);

            replaceDraft(mapFeRequisitionDetailToDraft(saved));

            toast.success(`Requisition #${saved.requisitionNumber} saved`);

            if (continueEditing) {
                router.push(withReturnTo(`/home-van-drivers/${saved.id}`, backHref));
            } else {
                router.push(backHref ?? "/home-van-drivers");
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
        const result = feRequisitionSchema.safeParse(draft);

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

            const request = mapFeRequisitionDraftToSaveRequest(draft);

            const submitted = draft.requisitionId
                ? await feRequisitionsApi.submitExisting(draft.requisitionId, request)
                : await feRequisitionsApi.submitNew(request);

            toast.success(`Requisition #${submitted.requisitionNumber} submitted`);
            router.push(backHref ?? "/home-van-drivers");
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
                submittedAtUtc={draft.submittedAtUtc}
                submittedByNameSnapshot={draft.submittedByNameSnapshot}
                onSaveDraft={handleSaveDraft}
                onSaveAndContinue={handleSaveAndContinue}
                onSubmit={handleSubmitRequest}
                onApprove={approvalActions.openApproveModal}
                onReject={approvalActions.openRejectModal}
            />

            <RequisitionFormErrorAlert message={errors.form} />

            <FeRequisitionTabs
                activeKey={activeKey}
                onActiveKeyChange={setActiveKey}
                taskTypes={taskTypes}
                usedTaskTypeIds={usedTaskTypeIds}
                submissionHistoryCount={draft.submissionHistory.length}
                getTaskTypeTabIssueSeverity={tabIssues.getTaskTypeTabIssueSeverity}
                mileageIssueSeverity={tabIssues.mileage}
                transfersIssueSeverity={tabIssues.transfers}
                additionalCostsIssueSeverity={tabIssues.additionalCosts}
                details={
                    <RequisitionDetailsTab
                        readonly={isReadonly}
                        draft={draft}
                        onRequisitionDateChange={setRequisitionDate}
                        onVanDriverChange={setVanDriver}
                        onVanDriverNameChange={setVanDriverName}
                        onShopChange={setShop}
                        errors={errors}
                        clearError={clearError}
                    />
                }
                mileage={
                    <FeMileageWorkspace
                        limitRule={resolveFeRequisitionLimitRule({
                            rules: limitRules,
                            category: REQUISITION_ROW_CATEGORIES.MILEAGE,
                        })}
                        readonly={isReadonly}
                        rows={draft.feMileages}
                        onAdd={(form) => {
                            addMileage(form);
                            clearError("feMileages");
                            clearError("form");
                        }}
                        onUpdate={(clientId, form) => {
                            updateMileage(clientId, form);
                            clearError("feMileages");
                            clearError("form");
                        }}
                        onDelete={removeMileage}
                    />
                }
                transfers={
                    <FeTransferWorkspace
                        limitRule={resolveFeRequisitionLimitRule({
                            rules: limitRules,
                            category: REQUISITION_ROW_CATEGORIES.TRANSFER,
                        })}
                        readonly={isReadonly}
                        transfers={draft.feTransfers}
                        onAdd={(form) => {
                            addTransfer(form);
                            clearError("feTransfers");
                            clearError("form");
                        }}
                        onUpdate={(clientId, form) => {
                            updateTransfer(clientId, form);
                            clearError("feTransfers");
                            clearError("form");
                        }}
                        onDelete={removeTransfer}
                    />
                }
                additionalCosts={
                    <FeAdditionalCostWorkspace
                        readonly={isReadonly}
                        rows={draft.feAdditionalCosts}
                        additionalCostLimitRule={resolveFeRequisitionLimitRule({
                            rules: limitRules,
                            category: REQUISITION_ROW_CATEGORIES.ADDITIONAL_COST,
                        })}
                        mileageLimitRule={resolveFeRequisitionLimitRule({
                            rules: limitRules,
                            category: REQUISITION_ROW_CATEGORIES.MILEAGE,
                        })}
                        onAdd={(form) => {
                            addAdditionalCost(form);
                            clearError("feAdditionalCosts");
                            clearError("form");
                        }}
                        onUpdate={(clientId, form) => {
                            updateAdditionalCost(clientId, form);
                            clearError("feAdditionalCosts");
                            clearError("form");
                        }}
                        onDelete={removeAdditionalCost}
                    />
                }
                submissionHistory={
                    <SubmissionHistoryTab
                        submissions={draft.submissionHistory}
                        submissionBasePath="/home-van-drivers/submissions"
                        returnTo={backHref}
                    />
                }
                renderTaskTypeTab={(taskTypeId) => {
                    const taskType = taskTypes.find((x) => x.id === taskTypeId);

                    if (!taskType) {
                        return null;
                    }

                    const tasks = draft.feGeneralTasks.filter((x) => x.taskTypeId === taskTypeId);

                    return (
                        <FeGeneralTaskWorkspace
                            limitRule={resolveFeRequisitionLimitRule({
                                rules: limitRules,
                                category: REQUISITION_ROW_CATEGORIES.GENERAL_TASK,
                                taskTypeId: taskType.id,
                            })}
                            readonly={isReadonly}
                            title={taskType.name}
                            code={taskType.code}
                            isTaskTypeInactive={!taskType.isActive}
                            tasks={tasks}
                            onAdd={(form) => {
                                addGeneralTask(taskType.id, taskType.name, form);
                                clearError("feGeneralTasks");
                                clearError("form");
                            }}
                            onUpdate={(clientId, form) => {
                                updateGeneralTask(clientId, form);

                                clearError("feGeneralTasks");
                                clearError("form");
                            }}
                            onDelete={removeGeneralTask}
                        />
                    );
                }}
            />

            {canSubmit && (
                <RequisitionSubmitModal
                    open={isSubmitModalOpen}
                    loading={activeAction === "submit"}
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
