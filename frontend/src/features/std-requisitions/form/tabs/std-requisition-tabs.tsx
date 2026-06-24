"use client";

import { buildStdRequisitionTabs } from "../lib/build-std-requisition-tabs";
import { useMemo } from "react";
import { RequisitionTabsFrame } from "@/features/requisitions-shared/components/requisitions-tab-frame";

type Props = {
    activeKey: string;
    onActiveKeyChange: (key: string) => void;
    details: React.ReactNode;
    collectionChargesBanksAndBins: React.ReactNode;
    collectionChargesBanksAndBinsHasWarning?: boolean;
    collectionVanPacks: React.ReactNode;
    collectionVanPacksHasWarning?: boolean;
    pickups: React.ReactNode;
    pickupsHasWarning?: boolean;
    transfers: React.ReactNode;
    transfersHasWarning?: boolean;
    additionalCosts: React.ReactNode;
    additionalCostsHasWarning?: boolean;
    submissionHistory: React.ReactNode;
    submissionHistoryCount: number;
};

export function StdRequisitionTabs({
    activeKey,
    onActiveKeyChange,
    details,
    collectionChargesBanksAndBins,
    collectionChargesBanksAndBinsHasWarning,
    collectionVanPacks,
    collectionVanPacksHasWarning,
    pickups,
    pickupsHasWarning,
    transfers,
    transfersHasWarning,
    additionalCosts,
    additionalCostsHasWarning,
    submissionHistory,
    submissionHistoryCount,

}: Readonly<Props>) {

    const tabs = useMemo(
        () => buildStdRequisitionTabs(submissionHistoryCount),
        [submissionHistoryCount],
    );

    const activeTab = tabs.find((x) => x.key === activeKey) ?? tabs[0];

    function tabHasWarning(tab: (typeof tabs)[number]) {
        if (tab.type === "banks-and-bins") {
            return collectionChargesBanksAndBinsHasWarning ?? false;
        }

        if (tab.type === "van-packs") {
            return collectionVanPacksHasWarning ?? false;
        }

        if (tab.type === "pickups") {
            return pickupsHasWarning ?? false;
        }

        if (tab.type === "transfers") {
            return transfersHasWarning ?? false;
        }

        if (tab.type === "additional-costs") {
            return additionalCostsHasWarning ?? false;
        }

        return false;
    }

    return (
        <RequisitionTabsFrame
            tabs={tabs}
            activeKey={activeTab.key}
            ariaLabel="STD requisition sections"
            onActiveKeyChange={onActiveKeyChange}
            getTabHasWarning={tabHasWarning}
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