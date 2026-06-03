"use client";

import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";

export function Topbar() {
    return (
        <header className={cn(
            "flex h-16 items-center justify-between",
            "border-b border-border bg-surface",
            "px-2 pe-3 flex-shrink-0 w-full"
        )}>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2 py-2">
                    <div className={cn(
                        "h-8 w-8 rounded-lg",
                        "bg-primary text-primary-foreground",
                        "flex items-center justify-center",
                        "font-bold text-sm flex-shrink-0"
                    )}>
                        V
                    </div>
                    <h1 className="font-semibold text-base hidden sm:block">
                        Van Driver Requisitions
                    </h1>
                    <span
                        className={cn(
                            "rounded-full border border-border",
                            "px-2 py-0.5",
                            "text-xs font-medium",
                            "text-muted-foreground",
                        )}
                    >
                        Prototype • Next.js + .NET API
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <UserMenu />
            </div>
        </header>
    );
}