"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { HomeIcon, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation, adminNavigation, approvalNavigation } from "@/lib/navigation";
import { SIDEBAR_COLLAPSE_KEY } from "@/lib/constants";
import { NavItem } from "@/components/layout/nav-item";
import { useAuth } from "@/providers/auth-provider";
import { canApproveRequisitions, canCreateRequisitions, canManageConfiguration } from "@/lib/auth/roles";
import { IconButton } from "../ui/button/icon-button";

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const { user } = useAuth();
    const showMainNavigation = canCreateRequisitions(user);
    const showApprovals = canApproveRequisitions(user);
    const showAdmin = canManageConfiguration(user);

    // Auto-collapse on small screens
    useEffect(() => {
        const mq = globalThis.matchMedia("(min-width: 1024px)");

        const sync = () => {
            if (mq.matches) {
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

    // Persist desktop collapse state
    useEffect(() => {
        if (globalThis.matchMedia("(min-width: 1024px)").matches) {
            localStorage.setItem(
                SIDEBAR_COLLAPSE_KEY,
                String(collapsed)
            );
        }
    }, [collapsed]);

    const isActive = (href: string) => pathname === href;

    return (
        <aside
            className={cn(
                "flex flex-col h-[calc(100vh-64px)]",
                "border-r border-border bg-surface",
                "overflow-hidden transition-all duration-300 ease-in-out",
                collapsed ? "w-16" : "w-60"
            )}
        >
            <div className="flex flex-col px-2 py-1.5">

                {/* COLLAPSED HEADER */}
                {collapsed && (
                    <div className="mb-2 flex justify-center">
                        <IconButton
                            size="md"
                            variant="ghost"
                            onClick={() => setCollapsed(false)}
                            aria-label="Expand sidebar"
                        >
                            <PanelLeft
                                size={18}
                                className="rotate-180"
                            />
                        </IconButton>
                    </div>
                )}

                {/* EXPANDED HEADER */}
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
                            onClick={() => setCollapsed(true)}
                            aria-label="Collapse sidebar"
                        >
                            <PanelLeft size={18} />
                        </IconButton>
                    </div>
                )}

                {/* HOME ICON (collapsed mode) */}
                {collapsed && (
                    <NavItem
                        href="/"
                        label="Home"
                        icon={HomeIcon}
                        active={isActive("/")}
                        collapsed
                    />
                )}

                {/* MAIN NAV */}
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

                {/* ADMIN */}
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