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
};

export function NavItem({
    href,
    label,
    icon: Icon,
    active,
    collapsed,
    showBadge,
}: Readonly<NavItemProps>) {
    return (
        <div className="relative group">
            {/* LINK */}
            <Link
                href={href}
                className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 transition",
                    collapsed ? "justify-center" : "justify-start",
                    active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground",
                )}
            >
                <div className="relative">
                    <Icon size={18} />
                    {showBadge && (
                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-surface" />
                    )}
                </div>
                {!collapsed && <span className="text-sm">{label}</span>}
            </Link>

            {/* TOOLTIP (ONLY WHEN COLLAPSED) */}
            {collapsed && (
                <div
                    className={cn(
                        "absolute left-full ml-2 top-1/2 -translate-y-1/2",
                        "px-3 py-1.5 rounded-md",
                        "bg-surface-elevated border border-border",
                        "text-xs font-medium text-foreground",
                        "shadow-md",
                        "opacity-0 group-hover:opacity-100",
                        "pointer-events-none",
                        "transition-opacity duration-200",
                        "whitespace-nowrap",
                        "z-50",
                    )}
                >
                    {label}

                    {/* little arrow */}
                    <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-surface-elevated border-l border-b border-border" />
                </div>
            )}
        </div>
    );
}
