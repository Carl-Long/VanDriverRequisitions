"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PanelLeft, HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { navigation, adminNavigation } from "@/lib/navigation";
import { NavItem } from "@/components/layout/nav-item";
import { useSubmitWindowStatus } from "@/hooks/use-submit-window-status";
import { SIDEBAR_COLLAPSE_KEY } from "@/lib/constants";

export function Sidebar() {
    const pathname = usePathname();

    const [collapsed, setCollapsed] = useState(false);

    // Auto-collapse on small screens; restore persisted state on large screens
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

    // Only persist the user's preference when on a large screen
    useEffect(() => {
        if (globalThis.matchMedia("(min-width: 1024px)").matches) {
            localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(collapsed));
        }
    }, [collapsed]);

    const isActive = (href: string) => pathname === href;

    const { status: windowStatus } = useSubmitWindowStatus();

    return (
        <aside
            className={cn(
                "flex flex-col h-[calc(100vh-64px)]",
                "border-r border-border bg-surface",
                "transition-all duration-300 ease-in-out",
                "overflow-hidden",
                collapsed ? "w-16" : "w-72"
            )}
        >
            {/* NAVIGATION SECTION */}
            <div className="flex flex-col p-2">
                {/* COLLAPSE BUTTON - integrated into nav */}
                <div className="flex items-center justify-end px-1 mb-2">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="
              flex h-8 w-8 items-center justify-center
              rounded-lg hover:bg-muted transition
            "
                        aria-label="Toggle sidebar"
                    >
                        <PanelLeft
                            size={18}
                            className={cn(
                                "transition-transform duration-300 ease-in-out",
                                collapsed ? "rotate-180" : "rotate-0"
                            )}
                        />
                    </button>
                </div>

                {/* HOME */}
                <div>
                    <NavItem
                        href="/"
                        label="Home"
                        icon={HomeIcon}
                        active={isActive("/")}
                        collapsed={collapsed}
                    />
                </div>

                {/* MAIN NAV */}
                <div className="mt-4 space-y-1">
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

                {/* ADMIN */}
                <div className="mt-6">
                    {!collapsed && (
                        <p className="px-3 mb-2 text-xs font-semibold uppercase text-muted-foreground">
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
                                showBadge={
                                    item.href === "/admin/submit-windows" &&
                                    windowStatus !== null &&
                                    !windowStatus.currentWindow &&
                                    !windowStatus.hasUpcoming
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>

        </aside>
    );
}