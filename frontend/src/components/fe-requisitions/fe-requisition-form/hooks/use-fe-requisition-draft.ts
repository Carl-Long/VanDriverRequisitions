"use client";

import { useMemo, useState } from "react";
import { FeRequisitionDraft, } from "../types/fe-requisition-draft";
import { VanDriverLookup } from "@/lib/api/van-drivers";
import { calculateGeneralTasksSubtotal } from "../utils/fe-requisition-calculations";
import { createEmptyFeGeneralTask, } from "../lib/create-empty-fe-general-task";


export function useFeRequisitionDraft() {
    const [draft, setDraft] =
        useState<FeRequisitionDraft>({
            requisitionDate: new Date(),

            vanDriverId: null,
            vanDriverLabel: null,

            vanDriverSummary: null,

            vanDriverName: "",

            shopId: null,
            shopLabel: null,

            generalTasks: [],
        });

    const subtotal = useMemo(() => {
        return calculateGeneralTasksSubtotal(
            draft.generalTasks,
        );
    }, [draft.generalTasks]);

    function setRequisitionDate(
        requisitionDate: Date | undefined,
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

            // Default driver name from trader
            vanDriverName:
                params.summary?.tradersName ?? "",
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
        }));
    }

    function addGeneralTask() {
        setDraft((prev) => ({
            ...prev,

            generalTasks: [
                ...prev.generalTasks,

                createEmptyFeGeneralTask(),
            ],
        }));
    }

    function removeGeneralTask(
        clientId: string,
    ) {
        setDraft((prev) => ({
            ...prev,

            generalTasks:
                prev.generalTasks.filter(
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
        removeGeneralTask
    };
}