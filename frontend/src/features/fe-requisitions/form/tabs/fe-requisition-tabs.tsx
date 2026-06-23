"use client";

import { AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { buildFeRequisitionTabs } from "../lib/build-fe-requisition-tabs";
import { FeTaskType } from "@/features/fe-task-types/fe-task-types-api";

type Props = {
    taskTypes: FeTaskType[];
    activeKey: string;
    onActiveKeyChange: (key: string) => void;
    details: React.ReactNode;
    renderTaskTypeTab: (taskTypeId: string) => React.ReactNode;
    mileage: React.ReactNode;
    mileageHasWarning?: boolean;
    transfers: React.ReactNode;
    transfersHasWarning?: boolean;
    additionalCosts: React.ReactNode;
    additionalCostsHasWarning?: boolean;
    submissionHistory: React.ReactNode;
    submissionHistoryCount: number;
    getTaskTypeTabHasWarning?: (taskTypeId: string) => boolean;
};

export function FeRequisitionTabs({
    taskTypes,
    activeKey,
    onActiveKeyChange,
    details,
    renderTaskTypeTab,
    mileage,
    transfers,
    additionalCosts,
    submissionHistory,
    submissionHistoryCount,
    getTaskTypeTabHasWarning,
    mileageHasWarning,
    transfersHasWarning,
    additionalCostsHasWarning,
}: Readonly<Props>) {
    const tabs = useMemo(
        () => buildFeRequisitionTabs(taskTypes, submissionHistoryCount),
        [taskTypes, submissionHistoryCount],
    );

    const activeTab = tabs.find((x) => x.key === activeKey) ?? tabs[0];

    function tabHasWarning(tab: (typeof tabs)[number]) {
        if (tab.type === "general-task") {
            return getTaskTypeTabHasWarning?.(tab.taskTypeId) ?? false;
        }

        if (tab.type === "mileage") {
            return mileageHasWarning ?? false;
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
        <div className="space-y-6">
            <div className="overflow-x-auto rounded-2xl border border-border bg-surface-elevated/70 p-1 shadow-sm">
                <div
                    role="tablist"
                    aria-label="Requisition sections"
                    className="flex min-w-max gap-1"
                >
                    {tabs.map((tab) => (
                        <TabButton
                            key={tab.key}
                            active={tab.key === activeTab?.key}
                            hasWarning={tabHasWarning(tab)}
                            onClick={() => onActiveKeyChange(tab.key)}
                        >
                            {tab.label}
                        </TabButton>
                    ))}
                </div>
            </div>

            <div role="tabpanel">
                {activeTab?.type === "details" && details}
                {activeTab?.type === "general-task" && renderTaskTypeTab(activeTab.taskTypeId)}
                {activeTab?.type === "mileage" && mileage}
                {activeTab?.type === "transfers" && transfers}
                {activeTab?.type === "additional-costs" && additionalCosts}
                {activeTab?.type === "submission-history" && submissionHistory}
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
                    title="This tab has warnings"
                    className={cn(
                        "inline-flex h-5 w-5 items-center justify-center rounded-full",
                        active ? "bg-warning/15 text-warning" : "bg-warning/10 text-warning",
                    )}
                >
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="sr-only">This tab has warnings</span>
                </span>
            )}
        </button>
    );
}