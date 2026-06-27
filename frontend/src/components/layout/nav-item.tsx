"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export type NavItemProps = {
    href: string;
    label: string;
    icon: LucideIcon;
    active: boolean;
    collapsed?: boolean;
    showBadge?: boolean;
    onNavigate?: () => void;
};

export function NavItem({
    href,
    label,
    icon: Icon,
    active,
    collapsed,
    showBadge,
    onNavigate,
}: Readonly<NavItemProps>) {
    return (
        <div className="group relative">
            <Link
                href={href}
                onClick={onNavigate}
                data-active-nav={active ? "true" : undefined}
                className={cn(
                    "flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                    collapsed ? "justify-center" : "justify-start",
                    active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted",
                )}
            >
                <div className="relative flex shrink-0 items-center justify-center">
                    <Icon className="size-[1.5em] shrink-0" />

                    {showBadge && (
                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-warning ring-2 ring-surface" />
                    )}
                </div>

                {!collapsed && <span className="truncate">{label}</span>}
            </Link>

            {collapsed && (
                <div
                    className={cn(
                        "absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2",
                        "rounded-md border border-border bg-surface-elevated",
                        "px-3 py-1.5",
                        "text-xs font-medium text-foreground",
                        "whitespace-nowrap shadow-md",
                        "pointer-events-none",
                        "opacity-0 transition-opacity duration-200",
                        "group-hover:opacity-100 group-focus-within:opacity-100",
                    )}
                >
                    {label}

                    <div className="absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-l border-border bg-surface-elevated" />
                </div>
            )}
        </div>
    );
}