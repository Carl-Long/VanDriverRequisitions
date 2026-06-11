/**
 * Shared TypeScript types and interfaces
 */

import { LucideIcon } from "lucide-react";


export type UserData = {
    name: string;
    email: string;
    initial: string;
};

export type MenuItem = {
    label: string;
    icon?: LucideIcon;
    action: () => void;
    variant?: "default" | "danger";
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
