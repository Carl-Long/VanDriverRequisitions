"use client";

import { useMemo, useState } from "react";

import type { VanDriverLookup } from "@/lib/api/van-drivers";
import type { StdRequisitionDraft } from "../types/std-requisition-draft";
import { createEmptyStdRequisitionDraft } from "../lib/create-empty-std-requisition-draft";
import { calculateStdRequisitionSubtotal } from "../lib/calculate-std-requisition-subtotal";
import type { StdCollectionChargeBanksAndBinsForm } from "../types/std-collection-charge-banks-and-bins-form";
import { createStdCollectionChargeBanksAndBinsDraftFromForm } from "../lib/create-std-collection-charge-banks-and-bins-draft-from-form";
import { calculateStdCollectionChargeBanksAndBinsFormTotal } from "../lib/calculate-std-collection-charge-banks-and-bins-form";

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

    function addCollectionChargeBanksAndBins(form: StdCollectionChargeBanksAndBinsForm) {
        const row = createStdCollectionChargeBanksAndBinsDraftFromForm({ form });

        setDraft((prev) => ({
            ...prev,
            collectionChargesBanksAndBins: [...prev.collectionChargesBanksAndBins, row],
        }));
    }

    function updateCollectionChargeBanksAndBins(
        clientId: string,
        form: StdCollectionChargeBanksAndBinsForm,
    ) {
        const totalValue = calculateStdCollectionChargeBanksAndBinsFormTotal(form);

        setDraft((prev) => ({
            ...prev,
            collectionChargesBanksAndBins: prev.collectionChargesBanksAndBins.map((row) => {
                if (row.clientId !== clientId) {
                    return row;
                }

                return {
                    ...row,

                    date: form.date,

                    collectionTypeId: form.collectionTypeId,
                    collectionTypeLabel: form.collectionTypeLabel,
                    collectionTypeCode: form.collectionTypeCode,

                    locationId: form.locationId,
                    locationLabel: form.locationLabel,
                    locationPostCode: form.locationPostCode,

                    numberOfBags: form.numberOfBags,

                    chargeType: form.chargeType,

                    miles: form.chargeType === "Mileage" ? form.miles : null,
                    ratePerMile: form.chargeType === "Mileage" ? form.ratePerMile : null,
                    flatCharge: form.chargeType === "FlatCharge" ? form.flatCharge : null,

                    totalValue,
                };
            }),
        }));
    }

    function removeCollectionChargeBanksAndBins(clientId: string) {
        setDraft((prev) => ({
            ...prev,
            collectionChargesBanksAndBins: prev.collectionChargesBanksAndBins.filter(
                (x) => x.clientId !== clientId,
            ),
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

        addCollectionChargeBanksAndBins,
        updateCollectionChargeBanksAndBins,
        removeCollectionChargeBanksAndBins,
    };
}
