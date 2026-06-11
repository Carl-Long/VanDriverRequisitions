import { cn } from "@/lib/utils";

type StatusBadgeProps = {
    active: boolean;
    className?: string;
};

export function StatusBadge({ active, className }: Readonly<StatusBadgeProps>) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground",
                className,
            )}
        >
            <span
                className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    active ? "bg-emerald-500" : "bg-muted-foreground/50",
                )}
            />
            {active ? "Active" : "Inactive"}
        </span>
    );
}
