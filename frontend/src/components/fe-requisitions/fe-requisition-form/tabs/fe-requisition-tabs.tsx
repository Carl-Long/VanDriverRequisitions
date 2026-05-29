"use client";

import { useMemo, useState } from "react";
import { buildFeRequisitionTabs } from "../lib/build-fe-requisition-tabs";
import { FeTaskType } from "@/lib/api/fe-task-types";
import { FeRequisitionPageMode } from "../types/fe-requisition-page-mode";

type Props = {
    mode: FeRequisitionPageMode;
    taskTypes: FeTaskType[];
    details: React.ReactNode;
    renderTaskTypeTab: (
        taskTypeId: string,
    ) => React.ReactNode;
};

export function FeRequisitionTabs({
    taskTypes,
    details,
    renderTaskTypeTab,
}: Readonly<Props>) {
    const tabs = useMemo(
        () =>
            buildFeRequisitionTabs(
                taskTypes,
            ),

        [taskTypes],
    );

    const [activeKey, setActiveKey] =
        useState("details");

    const activeTab = tabs.find(
        (x) => x.key === activeKey,
    );

    return (
        <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto border-b border-border">
                {tabs.map((tab) => (
                    <TabButton
                        key={tab.key}
                        active={
                            tab.key ===
                            activeKey
                        }
                        onClick={() =>
                            setActiveKey(
                                tab.key,
                            )
                        }
                    >
                        {tab.label}
                    </TabButton>
                ))}
            </div>

            {activeTab?.type ===
                "details" && details}

            {activeTab?.type ===
                "general-task" &&
                renderTaskTypeTab(
                    activeTab.taskTypeId,
                )}

            {activeTab?.type !==
                "details" &&
                activeTab?.type !==
                "general-task" && (
                    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="text-sm text-muted-foreground">
                            This section
                            will be
                            implemented
                            later
                        </div>
                    </div>
                )}
        </div>
    );
}

type TabButtonProps = {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
};

function TabButton({
    active,
    onClick,
    children,
}: Readonly<TabButtonProps>) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
        >
            {children}
        </button>
    );
}