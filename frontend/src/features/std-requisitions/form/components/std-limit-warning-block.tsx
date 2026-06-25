import { RequisitionLimitWarningBlock } from "@/features/requisitions-shared/components/requisition-limit-warning-block";

import type { StdChargeLimitStatus } from "../lib/get-std-charge-limit-status";

type Props = {
    status: StdChargeLimitStatus;
    className?: string;
};

export function StdLimitWarningBlock({ status, className }: Readonly<Props>) {
    return (
        <RequisitionLimitWarningBlock
            status={status}
            className={className}
        />
    );
}