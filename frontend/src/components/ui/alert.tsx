import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Info,
} from "lucide-react";
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

const iconMap = {
    success: CheckCircle2,
    info: Info,
    warning: AlertTriangle,
    danger: AlertCircle,
} as const;

export function Alert({
    tone = "danger",
    children,
    className,
}: Readonly<AlertProps>) {
    const Icon =
        tone in iconMap
            ? iconMap[tone as keyof typeof iconMap]
            : null;

    return (
        <div
            className={cn(
                "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
                toneMap[tone],
                className,
            )}
        >
            {Icon && (
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            )}

            <div>{children}</div>
        </div>
    );
}