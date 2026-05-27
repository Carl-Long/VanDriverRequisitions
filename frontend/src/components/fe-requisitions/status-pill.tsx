import { cn } from "@/lib/utils";

import {
    requisitionStatusConfig,
    statusVariants,
} from "./constants";

type Props = {
    status: string;
};

export function StatusPill({
    status,
}: Readonly<Props>) {
    const config =
        requisitionStatusConfig[
            status as keyof typeof requisitionStatusConfig
        ];

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                config
                    ? statusVariants[
                          config.variant
                      ]
                    : "bg-muted text-muted-foreground border-border-subtle",
            )}
        >
            {config?.label ?? status}
        </span>
    );
}