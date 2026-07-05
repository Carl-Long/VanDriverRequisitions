import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import {
    combineRequisitionTabIssueSeverities,
    getHistoricalLookupTabIssueSeverity,
    getLimitStatusTabIssueSeverity,
    REQUISITION_TAB_ISSUE_SEVERITY,
    type RequisitionTabIssueSeverity,
} from "@/features/requisitions-shared/types/requisition-tab-issue-severity";

import { getStdChargeLimitStatus } from "./get-std-charge-limit-status";
import { getStdCollectionVanPackLimitStatus } from "./get-std-collection-van-pack-limit-status";
import type { StdRequisitionDraft } from "../types/std-requisition-draft";

type Params = {
    draft: StdRequisitionDraft;
    isReadonly: boolean;
    stdMileageLimitRule?: RequisitionLimitRuleSummary;
    stdFlatChargeLimitRule?: RequisitionLimitRuleSummary;
    stdVanPackLimitRule?: RequisitionLimitRuleSummary;
};

export type StdRequisitionTabIssues = {
    collectionChargesBanksAndBins: RequisitionTabIssueSeverity;
    collectionVanPacks: RequisitionTabIssueSeverity;
    pickups: RequisitionTabIssueSeverity;
    transfers: RequisitionTabIssueSeverity;
    additionalCosts: RequisitionTabIssueSeverity;
};

const emptyIssues: StdRequisitionTabIssues = {
    collectionChargesBanksAndBins: REQUISITION_TAB_ISSUE_SEVERITY.None,
    collectionVanPacks: REQUISITION_TAB_ISSUE_SEVERITY.None,
    pickups: REQUISITION_TAB_ISSUE_SEVERITY.None,
    transfers: REQUISITION_TAB_ISSUE_SEVERITY.None,
    additionalCosts: REQUISITION_TAB_ISSUE_SEVERITY.None,
};

export function getStdRequisitionTabIssues({
    draft,
    isReadonly,
    stdMileageLimitRule,
    stdFlatChargeLimitRule,
    stdVanPackLimitRule,
}: Readonly<Params>): StdRequisitionTabIssues {
    if (isReadonly) {
        return emptyIssues;
    }

    return {
        collectionChargesBanksAndBins: combineRequisitionTabIssueSeverities(
            ...draft.collectionChargesBanksAndBins.map((row) =>
                combineRequisitionTabIssueSeverities(
                    getHistoricalLookupTabIssueSeverity(
                        row.isCollectionTypeActive === false ||
                            row.isLocationActive === false,
                    ),
                    getLimitStatusTabIssueSeverity(
                        getStdChargeLimitStatus(
                            row,
                            stdMileageLimitRule,
                            stdFlatChargeLimitRule,
                        ),
                    ),
                ),
            ),
        ),

        collectionVanPacks: combineRequisitionTabIssueSeverities(
            ...draft.collectionVanPacks.map((row) =>
                getLimitStatusTabIssueSeverity(
                    getStdCollectionVanPackLimitStatus(row, stdVanPackLimitRule),
                ),
            ),
        ),

        pickups: combineRequisitionTabIssueSeverities(
            ...draft.pickups.map((row) =>
                getLimitStatusTabIssueSeverity(
                    getStdChargeLimitStatus(
                        row,
                        stdMileageLimitRule,
                        stdFlatChargeLimitRule,
                    ),
                ),
            ),
        ),

        transfers: combineRequisitionTabIssueSeverities(
            ...draft.transfers.map((row) =>
                combineRequisitionTabIssueSeverities(
                    getHistoricalLookupTabIssueSeverity(
                        row.isShopFromActive === false || row.isShopToActive === false,
                    ),
                    getLimitStatusTabIssueSeverity(
                        getStdChargeLimitStatus(
                            row,
                            stdMileageLimitRule,
                            stdFlatChargeLimitRule,
                        ),
                    ),
                ),
            ),
        ),

        additionalCosts: combineRequisitionTabIssueSeverities(
            ...draft.additionalCosts.map((row) =>
                combineRequisitionTabIssueSeverities(
                    getHistoricalLookupTabIssueSeverity(row.isReasonActive === false),
                    getLimitStatusTabIssueSeverity(
                        getStdChargeLimitStatus(
                            row,
                            stdMileageLimitRule,
                            stdFlatChargeLimitRule,
                        ),
                    ),
                ),
            ),
        ),
    };
}