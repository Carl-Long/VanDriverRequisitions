"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { IconButton } from "@/components/ui/button/icon-button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    titleClassName?: string;
    children: ReactNode;
};

export function Modal({ open, onClose, title, titleClassName, children }: Readonly<ModalProps>) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [open]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const handleClose = () => onClose();
        dialog.addEventListener("close", handleClose);
        return () => dialog.removeEventListener("close", handleClose);
    }, [onClose]);

    return (
        <dialog
            ref={dialogRef}
            className={cn(
                "m-auto w-full max-w-lg overflow-visible rounded-2xl border border-border bg-surface p-0",
                "backdrop:bg-black/50 backdrop:backdrop-blur-sm",
                "shadow-xl",
            )}
        >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className={cn("text-lg font-semibold text-foreground", titleClassName)}>
                    {title}
                </h2>
                <IconButton
                    variant="ghost"
                    tone="default"
                    size="sm"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X className="size-[1.1em]" />
                </IconButton>
            </div>
            <div className="px-6 py-5">{children}</div>
        </dialog>
    );
}
