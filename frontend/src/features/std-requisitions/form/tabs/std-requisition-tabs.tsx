"use client";

import { cn } from "@/lib/utils";

type TabKey = "details" | "collection-charges-banks-and-bins" | "submission-history";

type Tab = {
    key: TabKey;
    label: string;
};

type Props = {
    activeKey: string;
    onActiveKeyChange: (key: TabKey) => void;
    details: React.ReactNode;
    collectionChargesBanksAndBins: React.ReactNode;
    submissionHistory: React.ReactNode;
    submissionHistoryCount: number;
};

export function StdRequisitionTabs({
    activeKey,
    onActiveKeyChange,
    details,
    collectionChargesBanksAndBins,
    submissionHistory,
    submissionHistoryCount,
}: Readonly<Props>) {
    const tabs: Tab[] = [
        { key: "details", label: "Details" },
        { key: "collection-charges-banks-and-bins", label: "Banks & Bins" },
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
    onClick: () => void;
    children: React.ReactNode;
};

function TabButton({ active, onClick, children }: Readonly<TabButtonProps>) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium outline-none transition-all duration-200",
                "cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                active
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
        >
            {children}
        </button>
    );
}