import { cn } from "@/lib/utils";

import type { StdChargeLimitStatus } from "../lib/get-std-charge-limit-status";

type Props = {
    status: StdChargeLimitStatus;
    className?: string;
};

export function StdLimitWarningBlock({ status, className }: Readonly<Props>) {
    if (status.state === "ok") {
        return null;
    }

    return (
        <div className={cn("space-y-1", className)}>
            <div className="text-xs font-medium text-warning">
                {status.state === "missing-limit"
                    ? "Missing limit"
                    : "Exceeds limit"}
            </div>

            <ul className="list-disc pl-4 text-xs text-warning">
                {status.messages.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                ))}
            </ul>
        </div>
    );
}