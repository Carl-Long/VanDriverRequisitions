import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Tone, toneMap, Variant } from "../theme";

type IconButtonSize = "xs" | "sm" | "md";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: Tone;
    variant?: Variant;
    size?: IconButtonSize;
    children: ReactNode;
};

const base =
    "inline-flex items-center justify-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

const sizeMap: Record<IconButtonSize, string> = {
    xs: "h-7 w-7 text-xs",
    sm: "h-8 w-8",
    md: "h-10 w-10",
};

export function IconButton({
    tone = "default",
    variant = "ghost",
    size = "md",
    className,
    children,
    ...props
}: IconButtonProps) {
    return (
        <button
            className={cn(
                base,
                sizeMap[size],
                toneMap[tone][variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}