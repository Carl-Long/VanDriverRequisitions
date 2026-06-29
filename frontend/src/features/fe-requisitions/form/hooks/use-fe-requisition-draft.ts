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
import { calculateFeTransferFormTotals } from "../lib/calculate-fe-transfer-form";
import { createFeTransferDraftFromForm } from "../lib/create-fe-transfer-draft-from-form";
import { FeTransferForm } from "../types/fe-transfer-form";
import { calculateFeAdditionalCostFormTotals } from "../lib/calculate-fe-additional-cost.form";
import { createFeAdditionalCostDraftFromForm } from "../lib/create-fe-additional-cost-draft-from-form";
import { FeAdditionalCostForm } from "../types/fe-additional-cost-form";
import { resolveSelectedLookupActiveState } from "@/features/requisitions-shared/lib/resolve-selected-lookup-active-state";

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
        }));
    }

    function setVanDriverName(vanDriverName: string) {
        setDraft((x) => ({
            ...x,
            vanDriverName,
        }));
    }

    function setShop(params: { id: string | null; label: string | null }) {
        setDraft((prev) => ({
            ...prev,
            shopId: params.id,
            shopLabel: params.label,
            isShopActive: resolveSelectedLookupActiveState({
                previousId: prev.shopId,
                previousIsActive: prev.isShopActive,
                nextId: params.id,
            }),
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

    function addTransfer(form: FeTransferForm) {
        const transfer = createFeTransferDraftFromForm({ form });

        setDraft((prev) => ({
            ...prev,
            feTransfers: [...prev.feTransfers, transfer],
        }));
    }

    function updateTransfer(clientId: string, form: FeTransferForm) {
        const totals = calculateFeTransferFormTotals(form);

        setDraft((prev) => ({
            ...prev,
            feTransfers: prev.feTransfers.map((transfer) => {
                if (transfer.clientId !== clientId) {
                    return transfer;
                }

                return {
                    ...transfer,

                    shopIdFrom: form.shopIdFrom,
                    shopLabelFrom: form.shopLabelFrom,
                    isShopFromActive: form.isShopFromActive,

                    shopIdTo: form.shopIdTo,
                    shopLabelTo: form.shopLabelTo,
                    isShopToActive: form.isShopToActive,

                    weekEndingDate: form.weekEndingDate,

                    quantities: {
                        ...form.quantities,
                    },

                    ratePerJob: form.ratePerJob,

                    totalNumber: totals.totalNumber,
                    totalValue: totals.totalValue,
                };
            }),
        }));
    }

    function removeTransfer(clientId: string) {
        setDraft((prev) => ({
            ...prev,
            feTransfers: prev.feTransfers.filter((x) => x.clientId !== clientId),
        }));
    }

    function addAdditionalCost(form: FeAdditionalCostForm) {
        const additionalCost = createFeAdditionalCostDraftFromForm({ form });

        setDraft((prev) => ({
            ...prev,
            feAdditionalCosts: [...prev.feAdditionalCosts, additionalCost],
        }));
    }

    function updateAdditionalCost(clientId: string, form: FeAdditionalCostForm) {
        const totals = calculateFeAdditionalCostFormTotals(form);

        setDraft((prev) => ({
            ...prev,
            feAdditionalCosts: prev.feAdditionalCosts.map((row) => {
                if (row.clientId !== clientId) {
                    return row;
                }

                return {
                    ...row,

                    weekEndingDate: form.weekEndingDate,

                    reasonId: form.reasonId,
                    reasonText: form.reasonText,
                    reasonCode: form.reasonCode,
                    isReasonActive: form.isReasonActive,

                    chargingOption: form.chargingOption,

                    totalNumber: form.chargingOption === "Job" ? form.totalNumber : null,
                    ratePerJob: form.chargingOption === "Job" ? form.ratePerJob : null,

                    miles: form.chargingOption === "Mileage" ? form.miles : null,
                    ratePerMile: form.chargingOption === "Mileage" ? form.ratePerMile : null,

                    totalValue: totals.totalValue,
                };
            }),
        }));
    }

    function removeAdditionalCost(clientId: string) {
        setDraft((prev) => ({
            ...prev,
            feAdditionalCosts: prev.feAdditionalCosts.filter((x) => x.clientId !== clientId),
        }));
    }

    function replaceDraft(nextDraft: FeRequisitionDraft) {
        setDraft(nextDraft);
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

        addTransfer,
        updateTransfer,
        removeTransfer,

        addAdditionalCost,
        updateAdditionalCost,
        removeAdditionalCost,

        replaceDraft,
    };
}
