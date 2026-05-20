import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md";
    children: ReactNode;
};

const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary:
        "border border-border bg-surface text-foreground hover:bg-muted",
    ghost: "text-foreground hover:bg-muted",
    danger: "bg-red-600 text-white hover:bg-red-700",
} as const;

const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
} as const;

export function Button({
    variant = "primary",
    size = "md",
    className,
    children,
    ...props
}: Readonly<ButtonProps>) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition",
                "disabled:pointer-events-none disabled:opacity-50",
                variantStyles[variant],
                sizeStyles[size],
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}
