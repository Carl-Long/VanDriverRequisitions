import { statusVariants } from "@/features/fe-requisitions/constants/fe-requisition-status.constants";
import { cn } from "@/lib/utils";
import { SubmissionStatus, submissionStatusConfig } from "./submission-status";

type Props = { status: SubmissionStatus };

export function SubmissionStatusPill({ status }: Readonly<Props>) {
    const config = submissionStatusConfig[status];

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                statusVariants[config.variant],
            )}
        >
            {config.label}
        </span>
    );
}