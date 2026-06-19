"use client";

import { useMemo, useState } from "react";

import type { VanDriverLookup } from "@/lib/api/van-drivers";
import type { StdRequisitionDraft } from "../types/std-requisition-draft";
import { createEmptyStdRequisitionDraft } from "../lib/create-empty-std-requisition-draft";
import { calculateStdRequisitionSubtotal } from "../lib/calculate-std-requisition-subtotal";

export function useStdRequisitionDraft(initialDraft?: StdRequisitionDraft) {
    const [draft, setDraft] = useState<StdRequisitionDraft>(
        initialDraft ?? createEmptyStdRequisitionDraft(),
    );

    const subtotal = useMemo(() => calculateStdRequisitionSubtotal(draft), [draft]);

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
        setDraft((x) => ({
            ...x,
            shopId: params.id,
            shopLabel: params.label,
            isShopActive: true,

            // Important later: locations are shop-specific.
            collectionChargesBanksAndBins: [],
        }));
    }

    return {
        draft,
        subtotal,

        setRowVersion,
        setRequisitionDate,
        setVanDriver,
        setVanDriverName,
        setShop,
    };
}