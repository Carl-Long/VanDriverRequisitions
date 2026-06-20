"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

type TabKey = "details" | "collection-charges-banks-and-bins" | "submission-history";

type Tab = {
    key: TabKey;
    label: string;
    hasWarning?: boolean;
};

type Props = {
    activeKey: string;
    onActiveKeyChange: (key: string) => void;
    details: React.ReactNode;
    collectionChargesBanksAndBins: React.ReactNode;
    submissionHistory: React.ReactNode;
    submissionHistoryCount: number;
    collectionChargesBanksAndBinsHasWarning?: boolean;
};

export function StdRequisitionTabs({
    activeKey,
    onActiveKeyChange,
    details,
    collectionChargesBanksAndBins,
    submissionHistory,
    submissionHistoryCount,
    collectionChargesBanksAndBinsHasWarning,
}: Readonly<Props>) {

    const tabs: Tab[] = [
        {
            key: "details",
            label: "Details",
        },
        {
            key: "collection-charges-banks-and-bins",
            label: "Banks & Bins Collections",
            hasWarning: collectionChargesBanksAndBinsHasWarning,
        },
        {
            key: "submission-history",
            label: `Submission History (${submissionHistoryCount})`,
        },
    ];

    const activeTab = tabs.find((x) => x.key === activeKey) ?? tabs[0];

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
                            hasWarning={tab.hasWarning}
                            onClick={() => onActiveKeyChange(tab.key)}
                        >
                            {tab.label}
                        </TabButton>
                    ))}
                </div>
            </div>

            <div role="tabpanel">
                {activeTab.key === "details" && details}
                {activeTab.key === "collection-charges-banks-and-bins" &&
                    collectionChargesBanksAndBins}
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