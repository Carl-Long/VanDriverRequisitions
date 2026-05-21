import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    className?: string;
    elevated?: boolean;
}>;

export function Surface({
    children,
    className,
    elevated = false,
}: Props) {
    return (
        <div
            className={cn(
                "rounded-xl border border-border shadow-sm",
                elevated ? "bg-surface-elevated" : "bg-surface",
                className
            )}
        >
            {children}
        </div>
    );
}