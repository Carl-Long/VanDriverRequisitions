import { cn } from "@/lib/utils";
import {
    stdRequisitionStatusConfig,
    stdStatusVariants,
    type StdRequisitionStatus,
} from "../../constants/std-requisition-status.constants";

type Props = {
    status: StdRequisitionStatus;
};

export function StdStatusPill({ status }: Readonly<Props>) {
    const config = stdRequisitionStatusConfig[status];

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                stdStatusVariants[config.variant],
            )}
        >
            {config.label}
        </span>
    );
}