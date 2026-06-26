"use client";

import { ReactNode, RefObject, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

import { IconButton } from "@/components/ui/button/icon-button";
import { getFocusableElements } from "./get-focusable-elements";

type Props = {
    open: boolean;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    onClose: () => void;
    initialFocusRef?: RefObject<HTMLElement | null>;
};

export function AppDrawer({
    open,
    title,
    children,
    footer,
    onClose,
    initialFocusRef,
}: Readonly<Props>) {
    const titleId = useId();
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!open) return;

        const dialog = dialogRef.current;
        if (!dialog) return;

        previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

        const originalBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        if (!dialog.open) {
            dialog.showModal();
        }

        globalThis.setTimeout(() => {
            const preferredElement = initialFocusRef?.current;

            if (preferredElement) {
                preferredElement.focus();
                return;
            }

            const focusableElements = getFocusableElements(dialog);
            focusableElements[0]?.focus();
        }, 0);

        return () => {
            document.body.style.overflow = originalBodyOverflow;

            if (dialog.open) {
                dialog.close();
            }

            globalThis.setTimeout(() => {
                previouslyFocusedElementRef.current?.focus?.();
            }, 0);
        };
    }, [open, initialFocusRef]);

    if (!open) {
        return null;
    }

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            className="
                fixed inset-0 z-50 m-0 h-screen max-h-none
                w-screen max-w-none border-0 bg-transparent p-0
                text-foreground
                backdrop:bg-black/40
                open:flex open:justify-end
            "
        >
            <div className="flex h-full w-full max-w-2xl flex-col bg-surface text-foreground shadow-2xl">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 id={titleId} className="text-lg font-semibold">
                        {title}
                    </h2>

                    <IconButton
                        type="button"
                        variant="ghost"
                        tone="accent"
                        size="sm"
                        aria-label="Close drawer"
                        onClick={onClose}
                    >
                        <X className="size-[1.1em]" />
                    </IconButton>
                </div>

                <div className="flex-1 overflow-y-auto p-6">{children}</div>

                {footer && <div className="border-t border-border px-6 py-4">{footer}</div>}
            </div>
        </dialog>
    );
}