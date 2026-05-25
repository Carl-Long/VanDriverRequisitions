import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Tone } from "./theme";

type AlertProps = {
    tone?: Tone;
    children: ReactNode;
    className?: string;
};

const toneMap: Record<Tone, string> = {
    default: "bg-surface text-foreground border-border",
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    success: "bg-success/10 text-success border-success/20",
    info: "bg-info/10 text-info border-info/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
};

export function Alert({ tone = "danger", children, className, }: Readonly<AlertProps>) {
    return (
        <div
            className={cn(
                "rounded-lg border px-4 py-3 text-sm",
                toneMap[tone],
                className
            )}
        >
            {children}
        </div>
    );
}