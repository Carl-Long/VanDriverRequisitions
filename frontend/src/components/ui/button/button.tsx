import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

import { Tone, Variant, toneMap } from "../theme";
import { Spinner } from "../spinner";

type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: Tone;
    variant?: Variant;
    size?: ButtonSize;
    loading?: boolean;
    children: ReactNode;
};

const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

const sizeMap: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
};

export function Button({
    tone = "primary",
    variant = "solid",
    size = "md",
    loading = false,
    disabled,
    className,
    children,
    ...props
}: Readonly<ButtonProps>) {
    return (
        <button
            className={cn(
                base,
                sizeMap[size],
                toneMap[tone][variant],
                loading && "cursor-wait",
                className
            )}
            disabled={disabled || loading}
            aria-busy={loading}
            {...props}
        >
            {loading && (
                <Spinner className="h-4 w-4 shrink-0" />
            )}

            <span
                className={cn(
                    "flex items-center gap-2",
                    loading && "cursor-wait"
                )}
            >
                {children}
            </span>
        </button>
    );
}