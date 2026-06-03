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
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/components/ui/alert";
import { FeTaskType } from "@/lib/api/fe-task-types";
import { SubmitWindowStatus } from "@/lib/api/submit-windows";

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

    const [isSaving, setIsSaving] = useState(false);

    const isReadonly = mode === "readonly";

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
                saved =
                    await feRequisitionsApi.create(request);
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
                    form:
                        err.detail ??
                        err.message,
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
                    form:
                        err.detail ??
                        err.message,
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

    async function handleSubmit() {
        setActiveAction("submit");

        try {
            await submitRequisition();
        } finally {
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
                onSaveDraft={handleSaveDraft}
                onSaveAndContinue={handleSaveAndContinue}
                onSubmit={handleSubmit}
            />

            {errors.form && (
                <Alert tone="warning">
                    {errors.form}
                </Alert>
            )}


            <FeRequisitionTabs
                mode={mode}
                activeKey={activeTab}
                onActiveKeyChange={setActiveTab}
                taskTypes={taskTypes}
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
        </div>
    );
}