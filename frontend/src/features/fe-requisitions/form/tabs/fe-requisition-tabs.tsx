"use client";

import { buildFeRequisitionTabs } from "../lib/build-fe-requisition-tabs";
import { FeTaskType } from "@/features/fe-task-types/fe-task-types-api";
import { FeRequisitionPageMode } from "../types/fe-requisition-page-mode";
import { useMemo } from "react";

type Props = {
    mode: FeRequisitionPageMode;
    taskTypes: FeTaskType[];
    activeKey: string;
    onActiveKeyChange: (key: string) => void;

    details: React.ReactNode;
    renderTaskTypeTab: (taskTypeId: string) => React.ReactNode;
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
    submissionHistory,
    submissionHistoryCount,
    getTaskTypeTabHasWarning,
}: Readonly<Props>) {
    const tabs = useMemo(
        () => buildFeRequisitionTabs(taskTypes, submissionHistoryCount),
        [taskTypes, submissionHistoryCount],
    );

    const activeTab = tabs.find((x) => x.key === activeKey);

    return (
        <div className="space-y-6">
            <div className="overflow-x-auto">
                <div className="inline-flex min-w-max gap-1 rounded-2xl bg-surface-elevated p-1">
                    {tabs.map((tab) => (
                        <TabButton
                            key={tab.key}
                            active={tab.key === activeKey}
                            onClick={() => onActiveKeyChange(tab.key)}
                        >
                            <span className="inline-flex items-center gap-2">
                                {tab.label}

                                {tab.type === "general-task" &&
                                    getTaskTypeTabHasWarning?.(tab.taskTypeId) && (
                                        <span
                                            className="h-2 w-2 rounded-full bg-warning"
                                            title="This tab has limit warnings"
                                        />
                                    )}
                            </span>
                        </TabButton>
                    ))}
                </div>
            </div>

            <div>
                {activeTab?.type === "details" && details}
                {activeTab?.type === "general-task" && renderTaskTypeTab(activeTab.taskTypeId)}
                {activeTab?.type === "submission-history" && submissionHistory}
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
            onClick={onClick}
            className={[
                "cursor-pointer whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                active
                    ? ["bg-accent", "text-accent-foreground", "shadow-sm"].join(" ")
                    : ["text-muted-foreground", "hover:text-foreground", "hover:bg-accent/20"].join(
                          " ",
                      ),
            ].join(" ")}
        >
            {children}
        </button>
    );
}
