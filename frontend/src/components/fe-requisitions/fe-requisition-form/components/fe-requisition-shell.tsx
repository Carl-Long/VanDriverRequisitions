"use client";

import { REQUISITION_ROW_CATEGORIES } from "@/lib/constants/requisition-row-categories";
import { FeRequisitionDetailsTab } from "../details/fe-requisition-details-tab";
import { FeGeneralTaskWorkspace } from "../general-tasks/fe-general-task-workspace";
import { FeRequisitionHeader } from "../header/fe-requisition-header";
import { useFeRequisitionDraft, } from "../hooks/use-fe-requisition-draft";
import { resolveFeRequisitionLimitRule } from "../lib/resolve-fe-requisiton-limit-rule";
import { FeRequisitionTabs } from "../tabs/fe-requisition-tabs";
import { FeRequisitionPageMode } from "../types/fe-requisition-page-mode";
import { RequisitionLimitRuleSummary } from "@/lib/api/requisition-limit-rules";
import { useState } from "react";
import { feRequisitionSchema } from "../schemas/fe-requisition-schema";
import { feRequisitionsApi, FeRequisitionDetail } from "@/lib/api/fe-requisitions";
import { mapFeRequisitionDraftToSaveRequest } from "../lib/map-fe-requisition-draft-to-save-request";
import { mapZodErrors } from "../lib/map-zod-errors";
import { useRouter } from "next/navigation";
import { useToast } from "@/providers/toast-provider";
import { mapFeRequisitionDetailToDraft } from "../lib/map-fe-requisition-detail-to-draft";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { Alert } from "@/components/ui/alert";
import { FeTaskType } from "@/lib/api/fe-task-types";
import { SubmitWindowStatus } from "@/lib/api/submit-windows";
import { FeRequisitionSubmitModal } from "./fe-requisition-submit-modal";
import { FeSubmissionHistoryTab } from "../../fe-submissions-view/fe-submission-history-tab";
import { FeRequisitionApproveModal } from "../approval/fe-requisition-approve-modal";
import { FeRequisitionRejectModal } from "../approval/fe-requisition-reject-modal";

type Props = {
    mode: FeRequisitionPageMode;
    limitRules: RequisitionLimitRuleSummary[];
    taskTypes: FeTaskType[];
    submitWindowStatus: SubmitWindowStatus | null;
    submitWindowStatusLoading: boolean;
    feRequisition?: FeRequisitionDetail;
};

export type SaveAction =
    | "saveAndContinue"
    | "saveAndClose"
    | "submit"
    | "approve"
    | "reject"
    | null;

export function FeRequisitionShell({ mode, limitRules, taskTypes, feRequisition, submitWindowStatus, submitWindowStatusLoading }: Readonly<Props>) {

    const initialDraft = feRequisition
        ? mapFeRequisitionDetailToDraft(feRequisition)
        : undefined;

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
        setRowVersion,
    } = useFeRequisitionDraft(initialDraft);

    const [activeAction, setActiveAction] = useState<SaveAction>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function clearError(
        field: string,
    ) {
        setErrors((prev) => {
            if (!prev[field]) {
                return prev;
            }

            const next = { ...prev };

            delete next[field];

            return next;
        });
    }

    const [activeTab, setActiveTab] = useState("details");
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isReadonly =
        mode === "readonly" ||
        mode === "approval";

    const router = useRouter();
    const toast = useToast();

    const canSubmitStatus =
        draft.status === null ||
        draft.status === "Draft" ||
        draft.status === "Rejected";

    const canSubmit = canSubmitStatus && !!submitWindowStatus?.currentWindow;

    async function saveRequisition(continueEditing: boolean = false): Promise<FeRequisitionDetail | undefined> {
        const result =
            feRequisitionSchema.safeParse(
                draft,
            );

        if (!result.success) {
            setErrors(
                mapZodErrors(
                    result.error,
                ),
            );

            setActiveTab("details");

            return;
        }

        try {
            setErrors({});
            setIsSaving(true);

            const request = mapFeRequisitionDraftToSaveRequest(draft);

            let saved;

            if (draft.requisitionId) {
                saved = await feRequisitionsApi.update(draft.requisitionId, request);
                setRowVersion(saved.rowVersion);
            } else {
                saved = await feRequisitionsApi.create(request);
            }

            toast.success(`Requisition #${saved.requisitionNumber} saved`);

            if (continueEditing) {
                router.push(`/home-van-drivers/${saved.id}`);
            } else {
                router.push("/home-van-drivers");
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setErrors({
                    form: getApiErrorMessage(
                        err,
                        "Failed to save requisition",
                    ),
                });

                return;
            }

            setErrors({
                form:
                    "Failed to save requisition",
            });
        } finally {
            setIsSaving(false);
        }
    }

    async function submitRequisition() {
        const result = feRequisitionSchema.safeParse(draft);

        if (!result.success) {
            setErrors(
                mapZodErrors(
                    result.error,
                ),
            );

            setActiveTab("details");
            return;
        }

        try {
            setErrors({});
            setIsSaving(true);

            const request = mapFeRequisitionDraftToSaveRequest(draft);

            const submitted = draft.requisitionId
                ? await feRequisitionsApi.submitExisting(
                    draft.requisitionId,
                    request,
                )
                : await feRequisitionsApi.submitNew(
                    request,
                );

            toast.success(`Requisition #${submitted.requisitionNumber} submitted`);
            router.push("/home-van-drivers");

        } catch (err) {
            if (err instanceof ApiError) {
                setErrors({
                    form: getApiErrorMessage(
                        err,
                        "Failed to save requisition",
                    ),
                });

                return;
            }

            setErrors({
                form:
                    "Failed to submit requisition",
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

            const approved = await feRequisitionsApi.approve(
                draft.requisitionId,
                {
                    rowVersion: draft.rowVersion,
                },
            );

            toast.success(`Requisition #${approved.requisitionNumber} approved`);
            router.push("/home-van-drivers/approvals");
        } catch (err) {
            if (err instanceof ApiError) {
                setErrors({
                    form: getApiErrorMessage(
                        err,
                        "Failed to save requisition",
                    ),
                });

                return;
            }

            setErrors({
                form: "Failed to approve requisition",
            });
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

            const rejected = await feRequisitionsApi.reject(draft.requisitionId,
                {
                    rowVersion: draft.rowVersion,
                    rejectionNotes,
                },
            );

            toast.success(`Requisition #${rejected.requisitionNumber} rejected`);
            router.push("/home-van-drivers/approvals");
        } catch (err) {
            if (err instanceof ApiError) {
                setErrors({
                    form: getApiErrorMessage(
                        err,
                        "Failed to save requisition",
                    ),
                });

                return;
            }

            setErrors({
                form: "Failed to reject requisition",
            });
        } finally {
            setIsSaving(false);
            setActiveAction(null);
        }
    }

    return (
        <div className="space-y-4">
            <FeRequisitionHeader
                mode={mode}
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

            <FeRequisitionTabs
                mode={mode}
                activeKey={activeTab}
                onActiveKeyChange={setActiveTab}
                taskTypes={taskTypes}
                submissionHistoryCount={draft.submissionHistory.length}
                details={
                    <FeRequisitionDetailsTab
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
                submissionHistory={
                    <FeSubmissionHistoryTab
                        submissions={
                            draft.submissionHistory
                        }
                    />
                }
                renderTaskTypeTab={(
                    taskTypeId,
                ) => {
                    const taskType =
                        taskTypes.find(
                            (x) =>
                                x.id ===
                                taskTypeId,
                        );

                    if (!taskType) {
                        return null;
                    }

                    const tasks =
                        draft.feGeneralTasks.filter(
                            (x) =>
                                x.taskTypeId ===
                                taskTypeId,
                        );

                    return (
                        <FeGeneralTaskWorkspace
                            limitRule={
                                resolveFeRequisitionLimitRule({
                                    rules: limitRules,
                                    categoryId:
                                        REQUISITION_ROW_CATEGORIES.GENERAL_TASK,
                                    taskTypeId:
                                        taskType.id,
                                })
                            }
                            readonly={
                                isReadonly
                            }
                            title={
                                taskType.name
                            }
                            code={
                                taskType.code
                            }
                            tasks={tasks}
                            onAdd={(form) => {
                                addGeneralTask(
                                    taskType.id,
                                    taskType.name,
                                    form,
                                );
                                clearError("generalTasks");
                                clearError("form");
                            }}
                            onUpdate={(
                                clientId,
                                form,
                            ) => {
                                updateGeneralTask(
                                    clientId,
                                    form,
                                );

                                clearError("generalTasks");
                                clearError("form");
                            }}
                            onDelete={
                                removeGeneralTask
                            }
                        />
                    );
                }}
            />

            {canSubmit && (
                <FeRequisitionSubmitModal
                    open={isSubmitModalOpen}
                    loading={activeAction === "submit"}
                    onClose={() => setIsSubmitModalOpen(false)}
                    onConfirm={handleSubmitConfirm}
                />
            )}

            {mode === "approval" && (
                <>
                    <FeRequisitionApproveModal
                        open={isApproveModalOpen}
                        loading={activeAction === "approve"}
                        onClose={() => setIsApproveModalOpen(false)}
                        onConfirm={handleApproveConfirm}
                    />

                    <FeRequisitionRejectModal
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