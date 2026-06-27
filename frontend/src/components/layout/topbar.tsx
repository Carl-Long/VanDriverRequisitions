"use client";

import { Menu } from "lucide-react";

import { IconButton } from "@/components/ui/button/icon-button";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";
import Link from "next/link";

type TopbarProps = {
    onMenuClick?: () => void;
};

export function Topbar({ onMenuClick }: Readonly<TopbarProps>) {
    return (
        <header
            className={cn(
                "flex h-14 w-full shrink-0 items-center justify-between",
                "border-b border-border bg-surface",
                "px-2 pe-3",
            )}
        >
            <div className="flex min-w-0 items-center gap-2">
                <IconButton
                    size="sm"
                    variant="ghost"
                    onClick={onMenuClick}
                    aria-label="Open navigation"
                    className="lg:hidden"
                >
                    <Menu className="size-[1.15em]" />
                </IconButton>

                <Link
                    href="/"
                    className="truncate rounded-md text-sm font-semibold transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base"
                    aria-label="Go to home"
                >
                    Van Driver Requisitions
                </Link>

                <span
                    className={cn(
                        "hidden rounded-full border border-border md:inline-flex",
                        "px-2 py-0.5",
                        "text-xs font-medium text-muted-foreground",
                    )}
                >
                    Prototype • Next.js + .NET API
                </span>
            </div>

            <div className="flex shrink-0 items-center gap-3">
                <UserMenu />
            </div>
        </header>
    );
}