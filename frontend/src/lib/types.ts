/**
 * Shared TypeScript types and interfaces
 */

import { LucideIcon } from "lucide-react";

export type NavItemProps = {
    href: string;
    label: string;
    icon: LucideIcon;
    active: boolean;
    collapsed?: boolean;
    showBadge?: boolean;
};

export type LaunchCardProps = {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
};

export type UserData = {
    name: string;
    email: string;
    initial: string;
};

export type MenuItem = {
    label: string;
    icon?: LucideIcon;
    action: () => void;
    variant?: "default" | "destructive";
};

export type PagedResult<T> = {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};
