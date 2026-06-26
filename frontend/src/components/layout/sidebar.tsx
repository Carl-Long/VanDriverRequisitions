"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { HomeIcon, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation, adminNavigation, approvalNavigation } from "@/lib/navigation";
import { SIDEBAR_COLLAPSE_KEY } from "@/lib/constants/constants";
import { NavItem } from "@/components/layout/nav-item";
import { useAuth } from "@/providers/auth-provider";
import {
    canApproveRequisitions,
    canCreateRequisitions,
    canManageConfiguration,
} from "@/features/auth/roles";
import { IconButton } from "../ui/button/icon-button";

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [isDesktop, setIsDesktop] = useState(true);
    
    const { user } = useAuth();
    const showMainNavigation = canCreateRequisitions(user);
    const showApprovals = canApproveRequisitions(user);
    const showAdmin = canManageConfiguration(user);

    // Auto-collapse on small screens, but only persist deliberate desktop toggles.
    useEffect(() => {
        const mq = globalThis.matchMedia("(min-width: 1024px)");

        const sync = () => {
            const desktop = mq.matches;
            setIsDesktop(desktop);

            if (desktop) {
                const saved = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);

                setCollapsed(saved === "true");
            } else {
                setCollapsed(true);
            }
        };

        sync();

        mq.addEventListener("change", sync);

        return () => mq.removeEventListener("change", sync);
    }, []);

    const collapseSidebar = () => {
        setCollapsed(true);

        if (isDesktop) {
            localStorage.setItem(SIDEBAR_COLLAPSE_KEY, "true");
        }
    };

    const expandSidebar = () => {
        setCollapsed(false);

        if (isDesktop) {
            localStorage.setItem(SIDEBAR_COLLAPSE_KEY, "false");
        }
    };

    const isActive = (href: string) => pathname === href;

    return (
        <aside
            className={cn(
                "flex h-[calc(100dvh-64px)] min-h-0 flex-col",
                "border-r border-border bg-surface",
                "transition-all duration-300 ease-in-out",
                collapsed ? "w-16 overflow-visible" : "w-60 overflow-hidden",
            )}
        >
            <div
                className={cn(
                    "flex h-full min-h-0 flex-col px-2 py-1.5",
                    collapsed ? "overflow-visible" : "overflow-y-auto overflow-x-hidden",
                )}
            >
                {collapsed && (
                    <div className="mb-2 flex justify-center">
                        <IconButton
                            size="md"
                            variant="ghost"
                            onClick={expandSidebar}
                            aria-label="Expand sidebar"
                        >
                            <PanelLeft className="size-[1.15em] rotate-180" />
                        </IconButton>
                    </div>
                )}

                {!collapsed && (
                    <div className="mb-3 flex items-center gap-2">
                        <div className="flex-1">
                            <NavItem
                                href="/"
                                label="Home"
                                icon={HomeIcon}
                                active={isActive("/")}
                                collapsed={false}
                            />
                        </div>

                        <IconButton
                            size="md"
                            variant="ghost"
                            onClick={collapseSidebar}
                            aria-label="Collapse sidebar"
                        >
                            <PanelLeft className="size-[1.15em] rotate-180" />
                        </IconButton>
                    </div>
                )}

                {collapsed && (
                    <NavItem
                        href="/"
                        label="Home"
                        icon={HomeIcon}
                        active={isActive("/")}
                        collapsed
                    />
                )}

                {showMainNavigation && (
                    <div className="mt-2 space-y-1">
                        {navigation.map((item) => (
                            <NavItem
                                key={item.href}
                                href={item.href}
                                label={item.title}
                                icon={item.icon}
                                active={isActive(item.href)}
                                collapsed={collapsed}
                            />
                        ))}
                    </div>
                )}

                {showApprovals && (
                    <div className="mt-2 space-y-1">
                        {approvalNavigation.map((item) => (
                            <NavItem
                                key={item.href}
                                href={item.href}
                                label={item.title}
                                icon={item.icon}
                                active={pathname.startsWith(item.href)}
                                collapsed={collapsed}
                            />
                        ))}
                    </div>
                )}

                {showAdmin && (
                    <div className="mt-4 border-t border-border pt-3">
                        {!collapsed && (
                            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Admin
                            </p>
                        )}

                        <div className="space-y-1">
                            {adminNavigation[0].items.map((item) => (
                                <NavItem
                                    key={item.href}
                                    href={item.href}
                                    label={item.title}
                                    icon={item.icon}
                                    active={isActive(item.href)}
                                    collapsed={collapsed}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
