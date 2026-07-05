import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

import { Spinner } from "../spinner";
import { Tone, toneMap, Variant } from "../theme";

type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: Tone;
    variant?: Variant;
    size?: ButtonSize;
    loading?: boolean;
    children: ReactNode;
};

const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

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
    const isDisabled = disabled || loading;

    return (
        <button
            className={cn(
                base,
                sizeMap[size],
                toneMap[tone][variant],
                className,
            )}
            disabled={isDisabled}
            aria-busy={loading}
            {...props}
        >
            {loading && <Spinner className="h-4 w-4 shrink-0" />}

            <span className="flex items-center gap-2">{children}</span>
        </button>
    );
}