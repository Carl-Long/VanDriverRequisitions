"use client";

import { useMemo, useState } from "react";

import { VanDriverLookup } from "@/lib/api/van-drivers";
import { FeRequisitionDraft } from "../types/fe-requisition-draft";
import { FeGeneralTaskForm } from "../types/fe-general-task-form";
import { FeMileageForm } from "../types/fe-mileage-form";

import { createEmptyFeRequisitionDraft } from "../lib/create-empty-fe-requisition-draft";
import { createFeGeneralTaskDraftFromForm } from "../lib/create-fe-general-task-draft-from-form";
import { createFeMileageDraftFromForm } from "../lib/create-fe-mileage-draft-from-form";

import { calculateFeGeneralTaskFormTotals } from "../lib/calculate-fe-general-task-form";
import { calculateFeMileageFormTotals } from "../lib/calculate-fe-mileage-form";
import { calculateFeRequisitionSubtotal } from "../utils/fe-requisition-calculations";

export function useFeRequisitionDraft(initialDraft?: FeRequisitionDraft) {
    const [draft, setDraft] = useState<FeRequisitionDraft>(
        initialDraft ?? createEmptyFeRequisitionDraft(),
    );

    const subtotal = useMemo(() => calculateFeRequisitionSubtotal(draft), [draft]);

    function setRowVersion(rowVersion: string | null) {
        setDraft((x) => ({
            ...x,
            rowVersion,
        }));
    }

    function setRequisitionDate(requisitionDate: Date | null) {
        setDraft((x) => ({
            ...x,
            requisitionDate,
        }));
    }

    function setVanDriver(params: {
        id: string | null;
        label: string | null;
        summary: VanDriverLookup | null;
    }) {
        setDraft((x) => ({
            ...x,
            vanDriverId: params.id,
            vanDriverLabel: params.label,
            vanDriverSummary: params.summary,
            isVanDriverActive: true,
        }));
    }

    function setVanDriverName(vanDriverName: string) {
        setDraft((x) => ({
            ...x,
            vanDriverName,
        }));
    }

    function setShop(params: { id: string | null; label: string | null }) {
        setDraft((x) => ({
            ...x,
            shopId: params.id,
            shopLabel: params.label,
            isShopActive: true,
        }));
    }

    function addGeneralTask(taskTypeId: string, taskTypeLabel: string, form: FeGeneralTaskForm) {
        const task = createFeGeneralTaskDraftFromForm({
            taskTypeId,
            taskTypeLabel,
            form,
        });

        setDraft((prev) => ({
            ...prev,
            feGeneralTasks: [...prev.feGeneralTasks, task],
        }));
    }

    function updateGeneralTask(clientId: string, form: FeGeneralTaskForm) {
        const totals = calculateFeGeneralTaskFormTotals(form);

        setDraft((prev) => ({
            ...prev,
            feGeneralTasks: prev.feGeneralTasks.map((task) => {
                if (task.clientId !== clientId) {
                    return task;
                }

                return {
                    ...task,
                    weekEndingDate: form.weekEndingDate,
                    quantities: {
                        ...form.quantities,
                    },
                    ratePerJob: form.ratePerJob,
                    totalNumber: totals.totalJobs,
                    totalValue: totals.totalValue,
                };
            }),
        }));
    }

    function removeGeneralTask(clientId: string) {
        setDraft((prev) => ({
            ...prev,
            feGeneralTasks: prev.feGeneralTasks.filter((x) => x.clientId !== clientId),
        }));
    }

    function addMileage(form: FeMileageForm) {
        const mileage = createFeMileageDraftFromForm({ form });

        setDraft((prev) => ({
            ...prev,
            feMileages: [...prev.feMileages, mileage],
        }));
    }

    function updateMileage(clientId: string, form: FeMileageForm) {
        const totals = calculateFeMileageFormTotals(form);

        setDraft((prev) => ({
            ...prev,
            feMileages: prev.feMileages.map((mileage) => {
                if (mileage.clientId !== clientId) {
                    return mileage;
                }

                return {
                    ...mileage,
                    weekEndingDate: form.weekEndingDate,
                    quantities: {
                        ...form.quantities,
                    },
                    ratePerMile: form.ratePerMile,
                    totalMiles: totals.totalMiles,
                    totalValue: totals.totalValue,
                };
            }),
        }));
    }

    function removeMileage(clientId: string) {
        setDraft((prev) => ({
            ...prev,
            feMileages: prev.feMileages.filter((x) => x.clientId !== clientId),
        }));
    }

    return {
        draft,
        subtotal,

        setRequisitionDate,
        setVanDriver,
        setVanDriverName,
        setShop,
        setRowVersion,

        addGeneralTask,
        updateGeneralTask,
        removeGeneralTask,

        addMileage,
        updateMileage,
        removeMileage,
    };
}
