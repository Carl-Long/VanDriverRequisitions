"use client";

import { useMemo, useState } from "react";
import type { VanDriverLookup } from "@/lib/api/van-drivers";
import type { StdRequisitionDraft } from "../types/std-requisition-draft";
import { createEmptyStdRequisitionDraft } from "../lib/create-empty-std-requisition-draft";
import { calculateStdRequisitionSubtotal } from "../lib/calculate-std-requisition-subtotal";
import type { StdCollectionChargeBanksAndBinsForm } from "../types/std-collection-charge-banks-and-bins-form";
import { createStdCollectionChargeBanksAndBinsDraftFromForm } from "../lib/create-std-collection-charge-banks-and-bins-draft-from-form";
import { createStdCollectionVanPackDraftFromForm } from "../lib/create-std-collection-van-pack-draft-from-form";
import { StdCollectionVanPackForm } from "../types/std-collection-van-pack-form";
import { createStdPickupDraftFromForm } from "../lib/create-std-pickup-draft-from-form";
import { StdPickupForm } from "../types/std-pickup-form";
import { createStdTransferDraftFromForm } from "../lib/create-std-transfer-draft-from-form";
import { StdTransferForm } from "../types/std-transfer-form";
import { createStdAdditionalCostDraftFromForm } from "../lib/create-std-additional-cost-draft-from-form";
import { StdAdditionalCostForm } from "../types/std-additional-cost-form";
import { updateStdCollectionChargeBanksAndBinsDraftFromForm } from "../lib/update-std-collection-charge-banks-and-bins-draft-from-form";
import { updateStdCollectionVanPackDraftFromForm } from "../lib/update-std-collection-van-pack-draft-from-form";
import { updateStdPickupDraftFromForm } from "../lib/update-std-pickup-draft-from-form";
import { updateStdTransferDraftFromForm } from "../lib/update-std-transfer-draft-from-form";
import { updateStdAdditionalCostDraftFromForm } from "../lib/update-std-additional-cost-draft-from-form";

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

    function updateCollectionChargeBanksAndBins(clientId: string, form: StdCollectionChargeBanksAndBinsForm) {
        setDraft((prev) => ({
            ...prev,
            collectionChargesBanksAndBins: prev.collectionChargesBanksAndBins.map((row) =>
                row.clientId === clientId
                    ? updateStdCollectionChargeBanksAndBinsDraftFromForm(row, form)
                    : row,
            ),
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

    function addCollectionVanPack(form: StdCollectionVanPackForm, ratePerVanPack: number) {
        const row = createStdCollectionVanPackDraftFromForm({
            form,
            ratePerVanPack,
        });

        setDraft((prev) => ({
            ...prev,
            collectionVanPacks: [...prev.collectionVanPacks, row],
        }));
    }

    function updateCollectionVanPack(
        clientId: string,
        form: StdCollectionVanPackForm,
        ratePerVanPack: number,
    ) {
        setDraft((prev) => ({
            ...prev,
            collectionVanPacks: prev.collectionVanPacks.map((row) =>
                row.clientId === clientId
                    ? updateStdCollectionVanPackDraftFromForm(
                        row,
                        form,
                        ratePerVanPack,
                    )
                    : row,
            ),
        }));
    }

    function removeCollectionVanPack(clientId: string) {
        setDraft((prev) => ({
            ...prev,
            collectionVanPacks: prev.collectionVanPacks.filter((row) => row.clientId !== clientId),
        }));
    }

    function addPickup(form: StdPickupForm) {
        const row = createStdPickupDraftFromForm(form);

        setDraft((prev) => ({
            ...prev,
            pickups: [...prev.pickups, row],
        }));
    }

    function updatePickup(clientId: string, form: StdPickupForm) {
        setDraft((prev) => ({
            ...prev,
            pickups: prev.pickups.map((row) =>
                row.clientId === clientId
                    ? updateStdPickupDraftFromForm(row, form)
                    : row,
            ),
        }));
    }
    function removePickup(clientId: string) {
        setDraft((prev) => ({
            ...prev,
            pickups: prev.pickups.filter((row) => row.clientId !== clientId),
        }));
    }

    function addTransfer(form: StdTransferForm) {
        const row = createStdTransferDraftFromForm(form);

        setDraft((prev) => ({
            ...prev,
            transfers: [...prev.transfers, row],
        }));
    }

    function updateTransfer(clientId: string, form: StdTransferForm) {
        setDraft((prev) => ({
            ...prev,
            transfers: prev.transfers.map((row) =>
                row.clientId === clientId
                    ? updateStdTransferDraftFromForm(row, form)
                    : row,
            ),
        }));
    }

    function removeTransfer(clientId: string) {
        setDraft((prev) => ({
            ...prev,
            transfers: prev.transfers.filter((row) => row.clientId !== clientId),
        }));
    }

    function addAdditionalCost(form: StdAdditionalCostForm) {
        const row = createStdAdditionalCostDraftFromForm(form);

        setDraft((prev) => ({
            ...prev,
            additionalCosts: [...prev.additionalCosts, row],
        }));
    }

    function updateAdditionalCost(clientId: string, form: StdAdditionalCostForm) {
        setDraft((prev) => ({
            ...prev,
            additionalCosts: prev.additionalCosts.map((row) =>
                row.clientId === clientId
                    ? updateStdAdditionalCostDraftFromForm(row, form)
                    : row,
            ),
        }));
    }

    function removeAdditionalCost(clientId: string) {
        setDraft((prev) => ({
            ...prev,
            additionalCosts: prev.additionalCosts.filter(
                (row) => row.clientId !== clientId,
            ),
        }));
    }

    function replaceDraft(nextDraft: StdRequisitionDraft) {
        setDraft(nextDraft);
    }

    return {
        draft,
        subtotal,

        replaceDraft,
        setRowVersion,
        setRequisitionDate,
        setVanDriver,
        setVanDriverName,
        setShop,

        addCollectionChargeBanksAndBins,
        updateCollectionChargeBanksAndBins,
        removeCollectionChargeBanksAndBins,

        addCollectionVanPack,
        updateCollectionVanPack,
        removeCollectionVanPack,

        addPickup,
        updatePickup,
        removePickup,

        addTransfer,
        updateTransfer,
        removeTransfer,

        addAdditionalCost,
        updateAdditionalCost,
        removeAdditionalCost,
    };
}
