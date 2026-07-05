"use client";

import { buildStdRequisitionTabs } from "../lib/build-std-requisition-tabs";
import { useMemo } from "react";
import { RequisitionTabsFrame } from "@/features/requisitions-shared/components/requisitions-tab-frame";
import {
    REQUISITION_TAB_ISSUE_SEVERITY,
    type RequisitionTabIssueSeverity,
} from "@/features/requisitions-shared/types/requisition-tab-issue-severity";

type Props = {
    activeKey: string;
    onActiveKeyChange: (key: string) => void;
    details: React.ReactNode;
    collectionChargesBanksAndBins: React.ReactNode;
    collectionVanPacks: React.ReactNode;
    pickups: React.ReactNode;
    transfers: React.ReactNode;
    additionalCosts: React.ReactNode;
    submissionHistory: React.ReactNode;
    submissionHistoryCount: number;
    collectionChargesBanksAndBinsIssueSeverity?: RequisitionTabIssueSeverity;
    collectionVanPacksIssueSeverity?: RequisitionTabIssueSeverity;
    pickupsIssueSeverity?: RequisitionTabIssueSeverity;
    transfersIssueSeverity?: RequisitionTabIssueSeverity;
    additionalCostsIssueSeverity?: RequisitionTabIssueSeverity;
};

export function StdRequisitionTabs({
    activeKey,
    onActiveKeyChange,
    details,
    collectionChargesBanksAndBins,
    collectionVanPacks,
    pickups,
    transfers,
    additionalCosts,
    submissionHistory,
    submissionHistoryCount,
    collectionChargesBanksAndBinsIssueSeverity,
    collectionVanPacksIssueSeverity,
    pickupsIssueSeverity,
    transfersIssueSeverity,
    additionalCostsIssueSeverity,
}: Readonly<Props>) {

    const tabs = useMemo(
        () => buildStdRequisitionTabs(submissionHistoryCount),
        [submissionHistoryCount],
    );

    const activeTab = tabs.find((x) => x.key === activeKey) ?? tabs[0];

    function getTabIssueSeverity(tab: (typeof tabs)[number]): RequisitionTabIssueSeverity {
        if (tab.type === "banks-and-bins") {
            return collectionChargesBanksAndBinsIssueSeverity ??
                REQUISITION_TAB_ISSUE_SEVERITY.None;
        }

        if (tab.type === "van-packs") {
            return collectionVanPacksIssueSeverity ??
                REQUISITION_TAB_ISSUE_SEVERITY.None;
        }

        if (tab.type === "pickups") {
            return pickupsIssueSeverity ?? REQUISITION_TAB_ISSUE_SEVERITY.None;
        }

        if (tab.type === "transfers") {
            return transfersIssueSeverity ?? REQUISITION_TAB_ISSUE_SEVERITY.None;
        }

        if (tab.type === "additional-costs") {
            return additionalCostsIssueSeverity ??
                REQUISITION_TAB_ISSUE_SEVERITY.None;
        }

        return REQUISITION_TAB_ISSUE_SEVERITY.None;
    }

    return (
        <RequisitionTabsFrame
            tabs={tabs}
            activeKey={activeTab.key}
            ariaLabel="STD requisition sections"
            onActiveKeyChange={onActiveKeyChange}
            getTabIssueSeverity={getTabIssueSeverity}
        >
            {activeTab.key === "details" && details}
            {activeTab.key === "collection-charges-banks-and-bins" && collectionChargesBanksAndBins}
            {activeTab.key === "collection-van-packs" && collectionVanPacks}
            {activeTab.key === "pickups" && pickups}
            {activeTab.key === "transfers" && transfers}
            {activeTab.key === "additional-costs" && additionalCosts}
            {activeTab.key === "submission-history" && submissionHistory}
        </RequisitionTabsFrame>
    );
}