"use client";

import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    REQUISITION_TAB_ISSUE_SEVERITY,
    type RequisitionTabIssueSeverity,
} from "../types/requisition-tab-issue-severity";

export type RequisitionTabFrameItem = {
    key: string;
    label: ReactNode;
};

type Props<TTab extends RequisitionTabFrameItem> = {
    tabs: readonly TTab[];
    activeKey: string;
    ariaLabel: string;
    onActiveKeyChange: (key: string) => void;
    getTabIssueSeverity?: (tab: TTab) => RequisitionTabIssueSeverity;
    children: ReactNode;
};

export function RequisitionTabsFrame<TTab extends RequisitionTabFrameItem>({
    tabs,
    activeKey,
    ariaLabel,
    onActiveKeyChange,
    getTabIssueSeverity,
    children,
}: Readonly<Props<TTab>>) {
    return (
        <div className="space-y-6">
            <div className="overflow-x-auto rounded-2xl border border-border bg-surface-elevated/70 p-1 shadow-sm">
                <div role="tablist" aria-label={ariaLabel} className="flex min-w-max gap-1">
                    {tabs.map((tab) => (
                        <RequisitionTabButton
                            key={tab.key}
                            active={tab.key === activeKey}
                            issueSeverity={
                                getTabIssueSeverity?.(tab) ??
                                REQUISITION_TAB_ISSUE_SEVERITY.None
                            }
                            onClick={() => onActiveKeyChange(tab.key)}
                        >
                            {tab.label}
                        </RequisitionTabButton>
                    ))}
                </div>
            </div>

            <div role="tabpanel">{children}</div>
        </div>
    );
}

type RequisitionTabButtonProps = {
    active: boolean;
    issueSeverity: RequisitionTabIssueSeverity;
    onClick: () => void;
    children: ReactNode;
};

function RequisitionTabButton({
    active,
    issueSeverity,
    onClick,
    children,
}: Readonly<RequisitionTabButtonProps>) {
    const hasIssue = issueSeverity !== REQUISITION_TAB_ISSUE_SEVERITY.None;
    const isBlocker = issueSeverity === REQUISITION_TAB_ISSUE_SEVERITY.Blocker;

    const Icon = isBlocker ? AlertCircle : AlertTriangle;

    const label = isBlocker
        ? "This tab has blocking issues"
        : "This tab has warnings";

    const warningClassName = active
        ? "bg-warning/15 text-warning"
        : "bg-warning/10 text-warning";

    const blockerClassName = active
        ? "bg-danger/15 text-danger"
        : "bg-danger/10 text-danger";

    const issueClassName = isBlocker ? blockerClassName : warningClassName;

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
            <span>{children}</span>

            {hasIssue && (
                <span
                    title={label}
                    className={cn(
                        "inline-flex h-5 w-5 items-center justify-center rounded-full",
                        issueClassName,
                    )}
                >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="sr-only">{label}</span>
                </span>
            )}
        </button>
    );
}