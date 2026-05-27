import { cn } from "@/lib/utils";

import {
    requisitionStatusConfig,
    statusVariants,
    type RequisitionStatus,
} from "./constants";

type Props = {
    status: RequisitionStatus;
};

export function StatusPill({
    status,
}: Readonly<Props>) {
    const config =
        requisitionStatusConfig[status];

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                statusVariants[config.variant],
            )}
        >
            {config.label}
        </span>
    );
}