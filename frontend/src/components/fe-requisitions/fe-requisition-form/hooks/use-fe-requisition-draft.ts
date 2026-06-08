"use client";

import { useMemo, useState } from "react";
import { FeRequisitionDraft, } from "../types/fe-requisition-draft";
import { VanDriverLookup } from "@/lib/api/van-drivers";
import { calculateGeneralTasksSubtotal } from "../utils/fe-requisition-calculations";

import { createFeGeneralTaskDraftFromForm } from "../lib/create-fe-general-task-draft-from-form";
import { FeGeneralTaskForm } from "../types/fe-general-task-form";
import { createEmptyFeRequisitionDraft } from "../lib/create-empty-fe-requisition-draft";
import { calculateFeGeneralTaskFormTotals } from "../lib/calculate-fe-general-task-form";

export function useFeRequisitionDraft(initialDraft?: FeRequisitionDraft) {

    const [draft, setDraft] =
        useState<FeRequisitionDraft>(
            initialDraft ??
            createEmptyFeRequisitionDraft(),
        );

    function setRowVersion(
        rowVersion: string | null,
    ) {
        setDraft(x => ({
            ...x,
            rowVersion,
        }));
    }

    const subtotal = useMemo(() => {
        return calculateGeneralTasksSubtotal(
            draft.feGeneralTasks,
        );
    }, [draft.feGeneralTasks]);

    function setRequisitionDate(
        requisitionDate: Date | null,
    ) {
        setDraft((x) => ({
            ...x,
            requisitionDate,
        }));
    }

    function setVanDriver(
        params: {
            id: string | null;
            label: string | null;
            summary: VanDriverLookup | null;
        },
    ) {
        setDraft((x) => ({
            ...x,

            vanDriverId: params.id,
            vanDriverLabel: params.label,
            vanDriverSummary: params.summary,
            isVanDriverActive: true,
        }));
    }

    function setVanDriverName(
        vanDriverName: string,
    ) {
        setDraft((x) => ({
            ...x,
            vanDriverName,
        }));
    }

    function setShop(params: {
        id: string | null;
        label: string | null;
    }) {
        setDraft((x) => ({
            ...x,

            shopId: params.id,
            shopLabel: params.label,
            isShopActive: true,
        }));
    }

    function addGeneralTask(
        taskTypeId: string,
        taskTypeLabel: string,
        form: FeGeneralTaskForm,
    ) {
        const task =
            createFeGeneralTaskDraftFromForm(
                {
                    taskTypeId,

                    taskTypeLabel,

                    form,
                },
            );

        setDraft((prev) => ({
            ...prev,

            feGeneralTasks: [
                ...prev.feGeneralTasks,

                task,
            ],
        }));
    }

    function updateGeneralTask(
        clientId: string,
        form: FeGeneralTaskForm,
    ) {
        const totals =
            calculateFeGeneralTaskFormTotals(
                form,
            );

        setDraft((prev) => ({
            ...prev,

            feGeneralTasks:
                prev.feGeneralTasks.map(
                    (task) => {
                        if (
                            task.clientId !==
                            clientId
                        ) {
                            return task;
                        }

                        return {
                            ...task,

                            weekEndingDate:
                                form.weekEndingDate,

                            quantities: {
                                ...form.quantities,
                            },

                            ratePerJob:
                                form.ratePerJob,

                            totalNumber:
                                totals.totalJobs,

                            totalValue:
                                totals.totalValue,
                        };
                    },
                ),
        }));
    }

    function removeGeneralTask(
        clientId: string,
    ) {
        setDraft((prev) => ({
            ...prev,

            feGeneralTasks:
                prev.feGeneralTasks.filter(
                    (x) =>
                        x.clientId !==
                        clientId,
                ),
        }));
    }

    return {
        draft,
        subtotal,
        setRequisitionDate,
        setVanDriver,
        setVanDriverName,
        setShop,
        addGeneralTask,
        updateGeneralTask,
        removeGeneralTask,
        setRowVersion
    };
}