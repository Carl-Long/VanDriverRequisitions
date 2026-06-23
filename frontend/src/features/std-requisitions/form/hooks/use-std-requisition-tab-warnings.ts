import { useMemo } from "react";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";

import { getStdChargeLimitStatus } from "../lib/get-std-charge-limit-status";
import { getStdCollectionVanPackLimitStatus } from "../lib/get-std-collection-van-pack-limit-status";
import type { StdRequisitionDraft } from "../types/std-requisition-draft";

type Params = {
    draft: StdRequisitionDraft;
    isReadonly: boolean;
    stdMileageLimitRule?: RequisitionLimitRuleSummary;
    stdFlatChargeLimitRule?: RequisitionLimitRuleSummary;
    stdVanPackLimitRule?: RequisitionLimitRuleSummary;
};

export type StdRequisitionTabWarnings = {
    collectionChargesBanksAndBinsHasWarning: boolean;
    collectionVanPacksHasWarning: boolean;
    pickupsHasWarning: boolean;
    transfersHasWarning: boolean;
    additionalCostsHasWarning: boolean;
};

const emptyWarnings: StdRequisitionTabWarnings = {
    collectionChargesBanksAndBinsHasWarning: false,
    collectionVanPacksHasWarning: false,
    pickupsHasWarning: false,
    transfersHasWarning: false,
    additionalCostsHasWarning: false,
};

export function useStdRequisitionTabWarnings({
    draft,
    isReadonly,
    stdMileageLimitRule,
    stdFlatChargeLimitRule,
    stdVanPackLimitRule,
}: Readonly<Params>): StdRequisitionTabWarnings {
    return useMemo(() => {
        if (isReadonly) {
            return emptyWarnings;
        }

        return {
            collectionChargesBanksAndBinsHasWarning:
                draft.collectionChargesBanksAndBins.some(
                    (row) =>
                        row.isCollectionTypeActive === false ||
                        row.isLocationActive === false ||
                        getStdChargeLimitStatus(
                            row,
                            stdMileageLimitRule,
                            stdFlatChargeLimitRule,
                        ).state !== "ok",
                ),
            collectionVanPacksHasWarning: draft.collectionVanPacks.some(
                (row) =>
                    getStdCollectionVanPackLimitStatus(
                        row,
                        stdVanPackLimitRule,
                    ).state !== "ok",
            ),

            pickupsHasWarning: draft.pickups.some(
                (row) =>
                    getStdChargeLimitStatus(
                        row,
                        stdMileageLimitRule,
                        stdFlatChargeLimitRule,
                    ).state !== "ok",
            ),

            transfersHasWarning: draft.transfers.some(
                (row) =>
                    getStdChargeLimitStatus(
                        row,
                        stdMileageLimitRule,
                        stdFlatChargeLimitRule,
                    ).state !== "ok",
            ),

            additionalCostsHasWarning: draft.additionalCosts.some(
                (row) =>
                    row.isReasonActive === false ||
                    getStdChargeLimitStatus(
                        row,
                        stdMileageLimitRule,
                        stdFlatChargeLimitRule,
                    ).state !== "ok",
            ),
        };
    }, [
        draft.collectionChargesBanksAndBins,
        draft.collectionVanPacks,
        draft.pickups,
        draft.transfers,
        draft.additionalCosts,
        isReadonly,
        stdMileageLimitRule,
        stdFlatChargeLimitRule,
        stdVanPackLimitRule,
    ]);
}