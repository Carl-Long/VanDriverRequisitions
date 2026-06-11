import { cn } from "@/lib/utils";

type SpinnerProps = { className?: string };

export function Spinner({ className }: Readonly<SpinnerProps>) {
    return (
        <div
            className={cn(
                "h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent",
                className,
            )}
        />
    );
}
