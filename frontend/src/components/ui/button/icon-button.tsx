import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    onClick?: () => void;
    className?: string;
}>;

export function IconButton({
    children,
    onClick,
    className,
}: Readonly<Props>) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                `
                inline-flex items-center gap-1 rounded-md
                px-3 py-1.5 text-sm font-medium
                text-foreground)
                transition-colors cursor-pointer
                hover:bg-surface-hover
                `,
                className
            )}
        >
            {children}
        </button>
    );
}