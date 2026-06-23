import { stdStatusVariants } from "../constants/std-requisition-status.constants";
import { cn } from "@/lib/utils";
import type { StdSubmissionStatus } from "./submission-status";
import { stdSubmissionStatusConfig } from "./submission-status";

type Props = {
    status: StdSubmissionStatus;
};

export function StdSubmissionStatusPill({ status }: Readonly<Props>) {
    const config = stdSubmissionStatusConfig[status];

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