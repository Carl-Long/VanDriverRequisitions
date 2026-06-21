"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { buildStdRequisitionTabs } from "../lib/build-std-requisition-tabs";
import { useMemo } from "react";

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
    submissionHistory,
    submissionHistoryCount,

}: Readonly<Props>) {

    const tabs = useMemo(() => buildStdRequisitionTabs(submissionHistoryCount), [submissionHistoryCount],);
    const activeTab = tabs.find((x) => x.key === activeKey) ?? tabs[0];

    function tabHasWarning(tab: (typeof tabs)[number]) {
        if (tab.type === "banks-and-bins") {
            return collectionChargesBanksAndBinsHasWarning;
        }

        if (tab.type === "van-packs") {
            return collectionVanPacksHasWarning;
        }

        if (tab.type === "pickups") {
            return pickupsHasWarning ?? false;
        }

        return false;
    }

    return (
        <div className="space-y-6">
            <div className="overflow-x-auto rounded-2xl border border-border bg-surface-elevated/70 p-1 shadow-sm">
                <div
                    role="tablist"
                    aria-label="STD requisition sections"
                    className="flex min-w-max gap-1"
                >
                    {tabs.map((tab) => (
                        <TabButton
                            key={tab.key}
                            active={tab.key === activeTab.key}
                            hasWarning={tabHasWarning(tab)}
                            onClick={() => onActiveKeyChange(tab.key)}
                        >
                            {tab.label}
                        </TabButton>
                    ))}
                </div>
            </div>

            <div role="tabpanel">
                {activeTab.key === "details" && details}
                {activeTab.key === "collection-charges-banks-and-bins" && collectionChargesBanksAndBins}
                {activeTab.key === "collection-van-packs" && collectionVanPacks}
                {activeTab.key === "pickups" && pickups}
                {activeTab.key === "submission-history" && submissionHistory}
            </div>
        </div>
    );
}

type TabButtonProps = {
    active: boolean;
    hasWarning?: boolean;
    onClick: () => void;
    children: React.ReactNode;
};

function TabButton({ active, hasWarning, onClick, children }: Readonly<TabButtonProps>) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium outline-none transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 cursor-pointer",
                active
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
        >
            <span>{children}</span>

            {hasWarning && (
                <span
                    title="This tab has limit warnings"
                    className={cn(
                        "inline-flex h-5 w-5 items-center justify-center rounded-full",
                        active ? "bg-warning/15 text-warning" : "bg-warning/10 text-warning",
                    )}
                >
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="sr-only">This tab has limit warnings</span>
                </span>
            )}
        </button>
    );
}