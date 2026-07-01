"use client";

import { useMemo, useState } from "react";

import { VanDriverLookup } from "@/lib/api/van-drivers";
import { FeRequisitionDraft } from "../types/fe-requisition-draft";
import { FeGeneralTaskForm } from "../types/fe-general-task-form";
import { FeMileageForm } from "../types/fe-mileage-form";

import { createEmptyFeRequisitionDraft } from "../lib/create-empty-fe-requisition-draft";
import { createFeGeneralTaskDraftFromForm } from "../lib/create-fe-general-task-draft-from-form";
import { createFeMileageDraftFromForm } from "../lib/create-fe-mileage-draft-from-form";

import { calculateFeRequisitionSubtotal } from "../utils/fe-requisition-calculations";
import { createFeTransferDraftFromForm } from "../lib/create-fe-transfer-draft-from-form";
import { FeTransferForm } from "../types/fe-transfer-form";
import { createFeAdditionalCostDraftFromForm } from "../lib/create-fe-additional-cost-draft-from-form";
import { FeAdditionalCostForm } from "../types/fe-additional-cost-form";
import { resolveSelectedLookupActiveState } from "@/features/requisitions-shared/lib/resolve-selected-lookup-active-state";
import { updateFeGeneralTaskDraftFromForm } from "../lib/update-fe-general-task-draft-from-form";
import { updateFeAdditionalCostDraftFromForm } from "../lib/update-fe-additional-cost-draft-from-form";
import { updateFeMileageDraftFromForm } from "../lib/update-fe-mileage-draft-from-form";
import { updateFeTransferDraftFromForm } from "../lib/update-fe-transfer-draft-from-form";

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
        setDraft((prev) => ({
            ...prev,
            feGeneralTasks: prev.feGeneralTasks.map((row) =>
                row.clientId === clientId
                    ? updateFeGeneralTaskDraftFromForm(row, form)
                    : row,
            ),
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
        setDraft((prev) => ({
            ...prev,
            feMileages: prev.feMileages.map((row) =>
                row.clientId === clientId
                    ? updateFeMileageDraftFromForm(row, form)
                    : row,
            ),
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
        setDraft((prev) => ({
            ...prev,
            feTransfers: prev.feTransfers.map((row) =>
                row.clientId === clientId
                    ? updateFeTransferDraftFromForm(row, form)
                    : row,
            ),
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
        setDraft((prev) => ({
            ...prev,
            feAdditionalCosts: prev.feAdditionalCosts.map((row) =>
                row.clientId === clientId
                    ? updateFeAdditionalCostDraftFromForm(row, form)
                    : row,
            ),
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
