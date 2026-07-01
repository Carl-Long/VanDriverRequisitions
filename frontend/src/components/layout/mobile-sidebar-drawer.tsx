"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { SidebarNavContent } from "@/components/layout/sidebar-nav-content";
import { IconButton } from "@/components/ui/button/icon-button";
import { cn } from "@/lib/utils";

type MobileSidebarDrawerProps = {
    open: boolean;
    onClose: () => void;
};

export function MobileSidebarDrawer({
    open,
    onClose,
}: Readonly<MobileSidebarDrawerProps>) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();

            requestAnimationFrame(() => {
                const focusTarget =
                    dialog.querySelector<HTMLElement>('[data-active-nav="true"]') ??
                    dialog.querySelector<HTMLElement>('[data-drawer-close="true"]') ??
                    dialog.querySelector<HTMLElement>("a, button");

                focusTarget?.focus({ preventScroll: true });
            });

            return;
        }

        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className={cn(
                "fixed inset-y-0 left-0 right-auto m-0",
                "h-dvh max-h-dvh w-72 max-w-[85vw] p-0",
                "border-r border-border bg-surface text-foreground shadow-xl",
                "backdrop:bg-black/40",
                "outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
                "lg:hidden",
            )}
            aria-label="Main navigation"
            onCancel={onClose}
            onClose={onClose}
        >
            <div className="flex h-full min-h-0 flex-col">
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3">
                    <Link
                        href="/"
                        onClick={onClose}
                        className="flex min-w-0 items-center gap-2 rounded-lg transition hover:opacity-90"
                        aria-label="Go to home"
                    >
                        <div
                            className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                "bg-primary text-sm font-bold text-primary-foreground",
                            )}
                        >
                            V
                        </div>

                        <p className="truncate text-sm font-semibold">
                            Van Driver Requisitions
                        </p>
                    </Link>

                    <IconButton
                        size="sm"
                        variant="ghost"
                        onClick={onClose}
                        aria-label="Close navigation"
                        title="Close navigation"
                        data-drawer-close="true"
                    >
                        <X className="size-[1.15em]" />
                    </IconButton>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
                    <SidebarNavContent showHomeLink onNavigate={onClose} />
                </div>
            </div>
        </dialog>
    );
}