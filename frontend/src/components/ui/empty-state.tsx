import type { ReactNode } from "react";

type Props = {
    title: string;
    action?: ReactNode;
};

export function EmptyState({
    title,
    action,
}: Readonly<Props>) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-foreground">
                {title}
            </p>

            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
}