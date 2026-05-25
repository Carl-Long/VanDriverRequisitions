import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonStyle = "solid" | "outline" | "ghost";
type ButtonTone = "default" | "primary" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    style?: ButtonStyle;
    tone?: ButtonTone;
    size?: "sm" | "md";
    loading?: boolean;
    children: ReactNode;
};

const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
} as const;

/* ---------------------------
   SOLID
---------------------------- */
const solidStyles: Record<ButtonTone, string> = {
    default: "bg-surface text-foreground hover:bg-surface-hover",
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
    danger: "bg-danger text-danger-foreground hover:opacity-90",
};

/* ---------------------------
   OUTLINE
---------------------------- */
const outlineStyles: Record<ButtonTone, string> = {
    default:
        "border border-border bg-transparent text-foreground hover:bg-surface-hover",

    primary:
        "border border-primary text-primary hover:bg-primary/10",

    secondary:
        "border border-secondary text-secondary hover:bg-secondary/10",

    danger:
        "border border-danger text-danger hover:bg-danger/10",
};

/* ---------------------------
   GHOST
---------------------------- */
const ghostStyles: Record<ButtonTone, string> = {
    default: "text-foreground hover:bg-surface-hover",
    primary: "text-primary hover:bg-primary/10",
    secondary: "text-secondary hover:bg-secondary/10",
    danger: "text-danger hover:bg-danger/10",
};

export function Button({
    style = "solid",
    tone = "primary",
    size = "md",
    className,
    children,
    disabled,
    loading = false,
    ...props
}: Readonly<ButtonProps>) {
    const variantClass =
        style === "solid"
            ? solidStyles[tone]
            : style === "outline"
                ? outlineStyles[tone]
                : ghostStyles[tone];

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition cursor-pointer",
                "disabled:pointer-events-none disabled:opacity-50",
                loading && "cursor-not-allowed opacity-70",
                sizeStyles[size],
                variantClass,
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}