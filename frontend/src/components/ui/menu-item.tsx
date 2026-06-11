"use client";

import { MenuItem as MenuItemType } from "@/lib/types";
import clsx from "clsx";

type MenuItemProps = MenuItemType;

export function MenuItem({
    label,
    icon: Icon,
    action,
    variant = "default",
}: Readonly<MenuItemProps>) {
    return (
        <button
            onClick={action}
            className={clsx(
                "w-full flex items-center gap-3 px-4 py-2 text-sm",
                "hover:bg-muted transition text-left",
                variant === "danger" && "text-danger",
            )}
        >
            {Icon && <Icon size={16} />}
            {label}
        </button>
    );
}
