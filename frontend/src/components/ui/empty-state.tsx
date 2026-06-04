import { Inbox } from "lucide-react";
import React from "react";

type Props = {
    title: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
};

export function EmptyState({
    title,
    description,
    icon,
}: Readonly<Props>) {
    return (
        <div className="flex items-center justify-center py-4">
            <div className="w-full max-w-sm rounded-lg border border-border-subtle bg-surface-subtle px-6 py-8 text-center">

                <div className="mb-4 flex justify-center">
                    {icon ? (
                        <div className="text-[rgb(var(--foreground-subtle))] opacity-40">
                            {React.createElement(icon, { className: "h-9 w-9" })}
                        </div>
                    ) : (
                        <Inbox className="h-9 w-9 text-[rgb(var(--foreground-subtle))] opacity-40" />
                    )}
                </div>

                <h3 className="text-sm font-medium text-foreground-subtle">
                    {title}
                </h3>

                {description && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}