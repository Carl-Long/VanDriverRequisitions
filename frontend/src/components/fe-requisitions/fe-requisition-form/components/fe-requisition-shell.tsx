"use client";

import { REQUISITION_ROW_CATEGORIES } from "@/lib/constants/requisition-row-categories";
import { FeRequisitionDetailsTab } from "../details/fe-requisition-details-tab";
import { FeGeneralTaskWorkspace } from "../general-tasks/fe-general-task-workspace";
import { FeRequisitionHeader } from "../header/fe-requisition-header";
import { useFeRequisitionDraft, } from "../hooks/use-fe-requisition-draft";
import { useFeTaskTypes } from "../hooks/use-fe-task-types";
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

type Props = {
    mode: FeRequisitionPageMode;
    limitRules: RequisitionLimitRuleSummary[];
    feRequisition?: FeRequisitionDetail;
};

export function FeRequisitionShell({ mode, limitRules, feRequisition }: Readonly<Props>) {

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
        removeGeneralTask,
    } = useFeRequisitionDraft(initialDraft);


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

    const result = feRequisitionSchema.safeParse(draft);

    const [isSaving, setIsSaving] = useState(false);

    const { taskTypes } = useFeTaskTypes();

    const isReadonly = mode === "readonly";

    const router = useRouter();
    const toast = useToast();

    async function saveRequisition(continueEditing: boolean = false) {
        const result =
            feRequisitionSchema.safeParse(
                draft,
            );

        console.log(result);

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

            const saved = await feRequisitionsApi.create(request);
            toast.success(`Requisition #${saved.requisitionNumber} saved`)
            if (continueEditing) {
                router.push(`/home-van-drivers/${saved.id}`);
            } else {
                router.push("/home-van-drivers");
            }

        } catch {
            console.log(errors);
            setErrors({
                form:
                    "Failed to save requisition",
            });
        } finally {
            setIsSaving(false);
        }
    }


    async function handleSaveDraft() {
        await saveRequisition();
    }

    async function handleSaveAndContinue() {
        await saveRequisition(true);
    }

    async function handleSubmit() {
        await saveRequisition();
    }



    return (
        <div className="space-y-6">
            <FeRequisitionHeader
                mode={mode}
                status="Draft"
                subtotal={subtotal}
                generalTaskCount={
                    draft.feGeneralTasks
                        .length
                }
                isSaving={isSaving}
                onSaveDraft={handleSaveDraft}
                onSaveAndContinue={
                    handleSaveAndContinue
                }
                onSubmit={handleSubmit}
            />

            {errors.form && (
                <div
                    className="
            rounded-lg border border-danger/30
            bg-danger/5 px-3 py-2
            text-sm text-danger
        "
                >
                    {errors.form}
                </div>
            )}


            <FeRequisitionTabs
                mode={mode}
                activeKey={activeTab}
                onActiveKeyChange={setActiveTab}
                taskTypes={taskTypes}
                details={
                    <FeRequisitionDetailsTab
                        readonly={
                            isReadonly
                        }
                        draft={draft}
                        onRequisitionDateChange={
                            setRequisitionDate
                        }
                        onVanDriverChange={
                            setVanDriver
                        }
                        onVanDriverNameChange={
                            setVanDriverName
                        }
                        onShopChange={
                            setShop
                        }
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