import { cn } from "@/lib/utils";

export function TableHeaderRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
    return (
        <tr
            className={cn(
                "text-xs font-semibold uppercase tracking-wide text-foreground",
                className
            )}
            {...props}
        />
    );
}