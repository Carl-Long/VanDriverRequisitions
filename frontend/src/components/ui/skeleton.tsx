import { cn } from "@/lib/utils";

export function Skeleton({ className }: Readonly<{ className?: string }>) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-surface-hover",
                className
            )}
        />
    );
}