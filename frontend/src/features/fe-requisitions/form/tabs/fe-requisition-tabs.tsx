"use client";

import { useMemo } from "react";
import { buildFeRequisitionTabs } from "../lib/build-fe-requisition-tabs";
import { FeTaskType } from "@/features/fe-task-types/fe-task-types-api";
import { RequisitionTabsFrame } from "@/features/requisitions-shared/components/requisitions-tab-frame";
import {
    REQUISITION_TAB_ISSUE_SEVERITY,
    type RequisitionTabIssueSeverity,
} from "@/features/requisitions-shared/types/requisition-tab-issue-severity";

type Props = {
    taskTypes: FeTaskType[];
    usedTaskTypeIds: ReadonlySet<string>;
    activeKey: string;
    onActiveKeyChange: (key: string) => void;
    details: React.ReactNode;
    renderTaskTypeTab: (taskTypeId: string) => React.ReactNode;
    mileage: React.ReactNode;
    transfers: React.ReactNode;
    additionalCosts: React.ReactNode;
    submissionHistory: React.ReactNode;
    submissionHistoryCount: number;
    mileageIssueSeverity?: RequisitionTabIssueSeverity;
    transfersIssueSeverity?: RequisitionTabIssueSeverity;
    additionalCostsIssueSeverity?: RequisitionTabIssueSeverity;
    getTaskTypeTabIssueSeverity?: (taskTypeId: string) => RequisitionTabIssueSeverity;

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
    usedTaskTypeIds,
    getTaskTypeTabIssueSeverity,
    mileageIssueSeverity,
    transfersIssueSeverity,
    additionalCostsIssueSeverity
}: Readonly<Props>) {
    const tabs = useMemo(
        () => buildFeRequisitionTabs(taskTypes, usedTaskTypeIds, submissionHistoryCount),
        [taskTypes, usedTaskTypeIds, submissionHistoryCount],
    );

    const activeTab = tabs.find((x) => x.key === activeKey) ?? tabs[0];

    function getTabIssueSeverity(tab: (typeof tabs)[number]): RequisitionTabIssueSeverity {
        if (tab.type === "general-task") {
            return combineTaskTypeIssueSeverity(
                tab.isInactive,
                getTaskTypeTabIssueSeverity?.(tab.taskTypeId) ??
                REQUISITION_TAB_ISSUE_SEVERITY.None,
            );
        }

        if (tab.type === "mileage") {
            return mileageIssueSeverity ?? REQUISITION_TAB_ISSUE_SEVERITY.None;
        }

        if (tab.type === "transfers") {
            return transfersIssueSeverity ?? REQUISITION_TAB_ISSUE_SEVERITY.None;
        }

        if (tab.type === "additional-costs") {
            return additionalCostsIssueSeverity ?? REQUISITION_TAB_ISSUE_SEVERITY.None;
        }

        return REQUISITION_TAB_ISSUE_SEVERITY.None;
    }

    return (
        <RequisitionTabsFrame
            tabs={tabs}
            activeKey={activeTab.key}
            ariaLabel="Requisition sections"
            onActiveKeyChange={onActiveKeyChange}
            getTabIssueSeverity={getTabIssueSeverity}
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

function combineTaskTypeIssueSeverity(
    isInactive: boolean,
    issueSeverity: RequisitionTabIssueSeverity,
): RequisitionTabIssueSeverity {
    if (issueSeverity === REQUISITION_TAB_ISSUE_SEVERITY.Blocker) {
        return issueSeverity;
    }

    return isInactive
        ? REQUISITION_TAB_ISSUE_SEVERITY.Warning
        : issueSeverity;
}

