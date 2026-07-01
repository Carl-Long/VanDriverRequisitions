"use client";

import { useState } from "react";
import { PanelLeftOpen } from "lucide-react";

import { SidebarBrand } from "@/components/layout/sidebar-brand";
import { SidebarNavContent } from "@/components/layout/sidebar-nav-content";
import { IconButton } from "@/components/ui/button/icon-button";
import { SIDEBAR_COLLAPSE_KEY } from "@/lib/constants/constants";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(() => {
        if (globalThis.window === undefined) {
            return false;
        }

        return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "true";
    });

    const collapseSidebar = () => {
        setCollapsed(true);
        localStorage.setItem(SIDEBAR_COLLAPSE_KEY, "true");
    };

    const expandSidebar = () => {
        setCollapsed(false);
        localStorage.setItem(SIDEBAR_COLLAPSE_KEY, "false");
    };

    return (
        <aside
            className={cn(
                "hidden h-screen min-h-0 flex-col border-r border-border bg-surface transition-all duration-300 ease-in-out lg:flex",
                collapsed ? "w-16 overflow-visible" : "w-60 overflow-hidden",
            )}
        >
            <div className="flex h-full min-h-0 flex-col">
                <SidebarBrand
                    collapsed={collapsed}
                    onCollapse={collapseSidebar}
                />

                <div
                    className={cn(
                        "min-h-0 flex-1 px-2 py-3",
                        collapsed
                            ? "overflow-visible"
                            : "overflow-y-auto overflow-x-hidden",
                    )}
                >
                    {collapsed && (
                        <div className="group relative mb-3 flex justify-center">
                            <IconButton
                                size="md"
                                variant="ghost"
                                onClick={expandSidebar}
                                aria-label="Expand sidebar"
                            >
                                <PanelLeftOpen className="size-[1.15em]" />
                            </IconButton>

                            <div
                                className={cn(
                                    "absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2",
                                    "rounded-md border border-border bg-surface-elevated",
                                    "px-3 py-1.5",
                                    "whitespace-nowrap text-xs font-medium text-foreground shadow-md",
                                    "pointer-events-none opacity-0 transition-opacity duration-200",
                                    "group-hover:opacity-100 group-focus-within:opacity-100",
                                )}
                            >
                                Expand sidebar

                                <div className="absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-l border-border bg-surface-elevated" />
                            </div>
                        </div>
                    )}

                    <SidebarNavContent collapsed={collapsed} />
                </div>
            </div>
        </aside>
    );
}