"use client";

import Link from "next/link";
import { PanelLeftClose } from "lucide-react";

import { IconButton } from "@/components/ui/button/icon-button";
import { cn } from "@/lib/utils";

type SidebarBrandProps = {
    collapsed: boolean;
    onCollapse: () => void;
};

export function SidebarBrand({
    collapsed,
    onCollapse,
}: Readonly<SidebarBrandProps>) {
    if (collapsed) {
        return (
            <div className="flex h-14 shrink-0 items-center justify-center border-b border-border px-2">
                <Link
                    href="/"
                    aria-label="Go to home"
                    className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full",
                        "bg-primary text-sm font-bold text-primary-foreground",
                        "transition hover:opacity-90",
                    )}
                >
                    V
                </Link>
            </div>
        );
    }

    return (
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-2">
            <Link
                href="/"
                aria-label="Go to home"
                className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    "bg-primary text-sm font-bold text-primary-foreground",
                    "transition hover:opacity-90",
                )}
            >
                V
            </Link>

            <div className="group relative">
                <IconButton
                    size="md"
                    variant="ghost"
                    onClick={onCollapse}
                    aria-label="Collapse sidebar"
                >
                    <PanelLeftClose className="size-[1.15em]" />
                </IconButton>

                <div
                    className={cn(
                        "absolute right-full top-1/2 z-50 mr-2 -translate-y-1/2",
                        "rounded-md border border-border bg-surface-elevated",
                        "px-3 py-1.5",
                        "whitespace-nowrap text-xs font-medium text-foreground shadow-md",
                        "pointer-events-none opacity-0 transition-opacity duration-200",
                        "group-hover:opacity-100 group-focus-within:opacity-100",
                    )}
                >
                    Collapse sidebar

                    <div className="absolute right-0 top-1/2 h-2 w-2 translate-x-1/2 -translate-y-1/2 rotate-45 border-r border-t border-border bg-surface-elevated" />
                </div>
            </div>
        </div>
    );
}