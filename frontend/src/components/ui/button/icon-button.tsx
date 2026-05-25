import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonStyle = "solid" | "outline" | "ghost";
type IconButtonTone = "default" | "primary" | "secondary" | "danger";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    style?: IconButtonStyle;
    tone?: IconButtonTone;
    size?: "sm" | "md";
    children: ReactNode;
};

const sizeStyles = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
} as const;

/* ---------------------------
   SOLID
---------------------------- */
const solidStyles: Record<IconButtonTone, string> = {
    default: "bg-surface text-foreground hover:bg-surface-hover",
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
    danger: "bg-danger text-danger-foreground hover:opacity-90",
};

/* ---------------------------
   OUTLINE
---------------------------- */
const outlineStyles: Record<IconButtonTone, string> = {
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
const ghostStyles: Record<IconButtonTone, string> = {
    default: "text-foreground hover:bg-surface-hover",
    primary: "text-primary hover:bg-primary/10",
    secondary: "text-secondary hover:bg-secondary/10",
    danger: "text-danger hover:bg-danger/10",
};

export function IconButton({
    children,
    onClick,
    className,
    style = "ghost",
    tone = "default",
    size = "md",
    disabled,
    ...props
}: Readonly<IconButtonProps>) {
    const variantClass =
        style === "solid"
            ? solidStyles[tone]
            : style === "outline"
                ? outlineStyles[tone]
                : ghostStyles[tone];

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "inline-flex items-center justify-center rounded-md transition",
                "cursor-pointer disabled:pointer-events-none disabled:opacity-50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                sizeStyles[size],
                variantClass,
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}