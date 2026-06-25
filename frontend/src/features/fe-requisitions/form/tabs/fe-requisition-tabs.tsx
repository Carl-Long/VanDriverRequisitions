"use client";

import { useMemo } from "react";
import { buildFeRequisitionTabs } from "../lib/build-fe-requisition-tabs";
import { FeTaskType } from "@/features/fe-task-types/fe-task-types-api";
import { RequisitionTabsFrame } from "@/features/requisitions-shared/components/requisitions-tab-frame";

type Props = {
    taskTypes: FeTaskType[];
    usedTaskTypeIds: ReadonlySet<string>;
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
    usedTaskTypeIds,
    mileageHasWarning,
    transfersHasWarning,
    additionalCostsHasWarning,
}: Readonly<Props>) {
    const tabs = useMemo(
        () => buildFeRequisitionTabs(taskTypes, usedTaskTypeIds, submissionHistoryCount),
        [taskTypes, usedTaskTypeIds, submissionHistoryCount],
    );

    const activeTab = tabs.find((x) => x.key === activeKey) ?? tabs[0];

    function tabHasWarning(tab: (typeof tabs)[number]) {
        if (tab.type === "general-task") {
            return tab.isInactive || (getTaskTypeTabHasWarning?.(tab.taskTypeId) ?? false);
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
        <RequisitionTabsFrame
            tabs={tabs}
            activeKey={activeTab.key}
            ariaLabel="Requisition sections"
            onActiveKeyChange={onActiveKeyChange}
            getTabHasWarning={tabHasWarning}
        >
            {activeTab.type === "details" && details}
            {activeTab.type === "general-task" && renderTaskTypeTab(activeTab.taskTypeId)}
            {activeTab.type === "mileage" && mileage}
            {activeTab.type === "transfers" && transfers}
            {activeTab.type === "additional-costs" && additionalCosts}
            {activeTab.type === "submission-history" && submissionHistory}
        </RequisitionTabsFrame>
    );
}
