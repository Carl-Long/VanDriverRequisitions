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


type Props = { mode: FeRequisitionPageMode; limitRules: RequisitionLimitRuleSummary[] };

export function FeRequisitionShell({ mode, limitRules }: Readonly<Props>) {
    const {
        draft,
        subtotal,
        setRequisitionDate,
        setVanDriver,
        setVanDriverName,
        setShop,
        addGeneralTask,
        removeGeneralTask,
    } = useFeRequisitionDraft();

    const { taskTypes } = useFeTaskTypes();

    const isReadonly = mode === "readonly";
    return (
        <div className="space-y-6">
            <FeRequisitionHeader
                mode={mode}
                status="Draft"
                subtotal={subtotal}
                generalTaskCount={
                    draft.generalTasks
                        .length
                }
            />

            <FeRequisitionTabs
                mode={mode}
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
                        draft.generalTasks.filter(
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
                            onAdd={(form) =>
                                addGeneralTask(
                                    taskType.id,

                                    taskType.name,

                                    form,
                                )
                            }
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