import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md";
    loading?: boolean;
    children: ReactNode;
};

const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary:
        "border border-border bg-surface text-foreground hover:bg-muted",
    ghost: "text-foreground hover:bg-muted",
    danger: "bg-danger text-danger hover:danger/90",
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
    disabled,
    loading = false,
    ...props
}: Readonly<ButtonProps>) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition cursor-pointer",
                "disabled:pointer-events-none disabled:opacity-50",
                variantStyles[variant],
                sizeStyles[size],
                loading && "cursor-not-allowed opacity-70",
                className,
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {children}
        </button>
    );
}
