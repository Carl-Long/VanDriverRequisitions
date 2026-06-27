"use client";

import { HomeIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { adminNavigation, approvalNavigation, navigation } from "@/lib/navigation";
import { NavItem } from "@/components/layout/nav-item";
import { useAuth } from "@/providers/auth-provider";
import {
    canApproveRequisitions,
    canCreateRequisitions,
    canManageConfiguration,
} from "@/features/auth/roles";
import { cn } from "@/lib/utils";

type SidebarNavContentProps = {
    collapsed?: boolean;
    showHomeLink?: boolean;
    onNavigate?: () => void;
    className?: string;
};

export function SidebarNavContent({
    collapsed = false,
    showHomeLink = false,
    onNavigate,
    className,
}: Readonly<SidebarNavContentProps>) {
    const pathname = usePathname();
    const { user } = useAuth();

    const showMainNavigation = canCreateRequisitions(user);
    const showApprovals = canApproveRequisitions(user);
    const showAdmin = canManageConfiguration(user);

    const isExactActive = (href: string) => pathname === href;

    const isMainNavigationActive = (href: string) =>
        pathname === href ||
        (pathname.startsWith(`${href}/`) && !pathname.startsWith(`${href}/approvals`));

    const isSectionActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    return (
        <nav className={cn("flex flex-col", className)} aria-label="Main navigation">
            {showHomeLink && (
                <div className="mb-2 border-b border-border pb-2">
                    <NavItem
                        href="/"
                        label="Home"
                        icon={HomeIcon}
                        active={isExactActive("/")}
                        collapsed={collapsed}
                        onNavigate={onNavigate}
                    />
                </div>
            )}

            {showMainNavigation && (
                <div className="space-y-1">
                    {navigation.map((item) => (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            label={item.title}
                            icon={item.icon}
                            active={isMainNavigationActive(item.href)}
                            collapsed={collapsed}
                            onNavigate={onNavigate}
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
                            active={isSectionActive(item.href)}
                            collapsed={collapsed}
                            onNavigate={onNavigate}
                        />
                    ))}
                </div>
            )}

            {showAdmin && (
                <div className="mt-4 border-t border-border pt-3">
                    {!collapsed && (
                        <p className="mb-2 px-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                                active={isSectionActive(item.href)}
                                collapsed={collapsed}
                                onNavigate={onNavigate}
                            />
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}