import { cn } from "@/lib/utils";

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
    return (
        <tr
            className={cn(
                "group transition-colors duration-150 hover:bg-surface-hover",
                className
            )}
            {...props}
        />
    );
}