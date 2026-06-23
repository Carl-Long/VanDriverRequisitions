import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
    readonly: boolean;
    ariaLabel: string;
    children: ReactNode;
    onEdit: () => void;
    className?: string;
};

export function EditableCellButton({
    readonly,
    ariaLabel,
    children,
    onEdit,
    className,
}: Readonly<Props>) {
    if (readonly) {
        return <span className={className}>{children}</span>;
    }

    return (
        <button
            type="button"
            aria-label={ariaLabel}
            className={cn(
                `
                    rounded-sm text-left underline-offset-2
                    hover:underline
                    focus-visible:outline-none
                    focus-visible:ring-2 focus-visible:ring-ring
                    focus-visible:ring-offset-2 focus-visible:ring-offset-surface
                    cursor-pointer
                `,
                className,
            )}
            onClick={(event) => {
                event.stopPropagation();
                onEdit();
            }}
        >
            {children}
        </button>
    );
}