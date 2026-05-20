"use client";

import Link from "next/link";
import { NavItemProps } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NavItem({
    href,
    label,
    icon: Icon,
    active,
    collapsed,
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
                        : "hover:bg-muted text-foreground"
                )}
            >
                <Icon size={18} />
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
                        "z-50"
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