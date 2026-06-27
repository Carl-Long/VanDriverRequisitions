"use client";

import { useEffect, useState } from "react";
import { X, Check, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

import type { Toast } from "./toast-types";

const variantConfig = {
    success: {
        icon: Check,
        iconClass: "text-success bg-success/10",
    },
    error: {
        icon: AlertCircle,
        iconClass: "text-accent bg-accent/10",
    },
    info: {
        icon: Info,
        iconClass: "text-accent bg-accent/10",
    },
} as const;

function getToastAria(variant: Toast["variant"]) {
    const isError = variant === "error";

    return {
        role: isError ? "alert" : "status",
        ariaLive: isError ? "assertive" : "polite",
    } as const;
}

export function ToastHost({
    toasts,
    onDismiss,
}: Readonly<{ toasts: Toast[]; onDismiss: (id: number) => void }>) {
    return (
        <div
            className={cn(
                "pointer-events-none fixed z-[100]",
                "top-[calc(env(safe-area-inset-top)+0.75rem)] left-1/2",
                "flex w-[calc(100vw-1.5rem)] max-w-sm -translate-x-1/2 flex-col gap-3",
                "md:left-auto md:right-6 md:top-20 md:w-full md:translate-x-0",
            )}
        >
            {toasts.map((t, index) => (
                <div
                    key={t.id}
                    style={{
                        transform: `translateY(${index * 2}px)`,
                        zIndex: 100 - index,
                    }}
                >
                    <ToastItem toast={t} onDismiss={() => onDismiss(t.id)} />
                </div>
            ))}
        </div>
    );
}

function ToastItem({ toast, onDismiss }: Readonly<{ toast: Toast; onDismiss: () => void }>) {
    const [visible, setVisible] = useState(false);

    const { icon: Icon, iconClass } = variantConfig[toast.variant];

    const { role, ariaLive } = getToastAria(toast.variant);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(t);
    }, []);

    return (
        <div
            role={role}
            aria-live={ariaLive}
            aria-atomic="true"
            className={cn(
                "relative overflow-hidden",
                "pointer-events-auto",
                "flex items-center gap-3",
                "rounded-xl border border-border/60",
                "bg-surface-elevated",
                "backdrop-blur-xl",
                "shadow-[0_10px_30px_rgb(0_0_0/0.12)]",
                "transition-all duration-200 ease-out",
                visible
                    ? "translate-y-0 opacity-100 scale-100 md:translate-x-0"
                    : "translate-y-2 opacity-0 scale-[0.98] md:translate-y-0 md:translate-x-4",
            )}
        >
            <div className="flex w-full items-center gap-3 pl-5 pr-3 py-3">
                <div
                    className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconClass)}
                >
                    <Icon className="size-[1em]" />
                </div>

                <p className="flex-1 text-sm leading-snug text-foreground">{toast.message}</p>

                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss notification"
                    className="
                        rounded-md p-1
                        text-muted-foreground
                        hover:bg-surface-hover hover:text-foreground
                        transition
                    "
                >
                    <X className="size-[1.1em]" />
                </button>
            </div>
        </div>
    );
}
