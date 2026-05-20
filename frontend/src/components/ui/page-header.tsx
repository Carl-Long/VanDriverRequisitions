import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PageHeaderProps = {
    title: string;
    description?: string;
    children?: ReactNode;
};

export function PageHeader({
    title,
    description,
    children,
}: Readonly<PageHeaderProps>) {
    return (
        <div
            className={cn(
                "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
                "pb-6",
            )}
        >
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {children && <div className="flex items-center gap-3">{children}</div>}
        </div>
    );
}
