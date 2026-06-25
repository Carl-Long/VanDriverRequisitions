"use client";

import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

export type RequisitionTabFrameItem = {
    key: string;
    label: ReactNode;
};

type Props<TTab extends RequisitionTabFrameItem> = {
    tabs: readonly TTab[];
    activeKey: string;
    ariaLabel: string;
    onActiveKeyChange: (key: string) => void;
    getTabHasWarning?: (tab: TTab) => boolean;
    children: ReactNode;
};

export function RequisitionTabsFrame<TTab extends RequisitionTabFrameItem>({
    tabs,
    activeKey,
    ariaLabel,
    onActiveKeyChange,
    getTabHasWarning,
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
                            hasWarning={getTabHasWarning?.(tab) ?? false}
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
    hasWarning?: boolean;
    onClick: () => void;
    children: ReactNode;
};

function RequisitionTabButton({
    active,
    hasWarning,
    onClick,
    children,
}: Readonly<RequisitionTabButtonProps>) {
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